const pool = require("../config/database");

async function createSale(req, res) {
  const client = await pool.connect();

  try {
    const { company_id, customer_id, payment_method, items } = req.body;

    if (!company_id || !items || items.length === 0) {
      return res.status(400).json({
        message: "Empresa e itens da venda são obrigatórios."
      });
    }

    const companyCheck = await client.query(
      "SELECT id FROM companies WHERE id = $1 AND user_id = $2",
      [company_id, req.user.id]
    );

    if (companyCheck.rows.length === 0) {
      return res.status(403).json({
        message: "Empresa não encontrada ou sem permissão."
      });
    }

    if (customer_id) {
      const customerCheck = await client.query(
        "SELECT id FROM customers WHERE id = $1 AND company_id = $2",
        [customer_id, company_id]
      );

      if (customerCheck.rows.length === 0) {
        return res.status(400).json({
          message: "Cliente não encontrado para esta empresa."
        });
      }
    }

    await client.query("BEGIN");

    let total = 0;
    const saleItems = [];

    for (const item of items) {
      const { product_id, quantity } = item;

      const productResult = await client.query(
        `SELECT id, name, sale_price, cost_price, stock_quantity
         FROM products
         WHERE id = $1 AND company_id = $2`,
        [product_id, company_id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Produto ${product_id} não encontrado.`);
      }

      const product = productResult.rows[0];

      if (Number(product.stock_quantity) < Number(quantity)) {
        throw new Error(`Estoque insuficiente para o produto: ${product.name}`);
      }

      const unitPrice = Number(product.sale_price);
      const unitCost = Number(product.cost_price || 0);
      const subtotal = unitPrice * Number(quantity);
      const totalCost = unitCost * Number(quantity);
      const profit = subtotal - totalCost;

      total += subtotal;

      saleItems.push({
        product_id,
        quantity: Number(quantity),
        unit_price: unitPrice,
        unit_cost: unitCost,
        subtotal,
        total_cost: totalCost,
        profit
      });
    }

    const saleResult = await client.query(
      `INSERT INTO sales (company_id, customer_id, total, payment_method)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [company_id, customer_id || null, total, payment_method]
    );

    const sale = saleResult.rows[0];

    for (const item of saleItems) {
      await client.query(
        `INSERT INTO sale_items 
         (sale_id, product_id, quantity, unit_price, unit_cost, subtotal, total_cost, profit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          sale.id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.unit_cost,
          item.subtotal,
          item.total_cost,
          item.profit
        ]
      );

      await client.query(
        `UPDATE products
         SET stock_quantity = stock_quantity - $1
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );

      await client.query(
        `INSERT INTO stock_movements (company_id, product_id, type, quantity, reason)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          company_id,
          item.product_id,
          "exit",
          item.quantity,
          `Venda #${sale.id}`
        ]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Venda criada com sucesso.",
      sale
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      message: error.message
    });
  } finally {
    client.release();
  }
}

async function listSales(req, res) {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({
        message: "Informe o company_id."
      });
    }

    const companyCheck = await pool.query(
      "SELECT id FROM companies WHERE id = $1 AND user_id = $2",
      [company_id, req.user.id]
    );

    if (companyCheck.rows.length === 0) {
      return res.status(403).json({
        message: "Empresa não encontrada ou sem permissão."
      });
    }

    const result = await pool.query(
      `SELECT s.*, c.name AS customer_name
       FROM sales s
       LEFT JOIN customers c ON c.id = s.customer_id
       WHERE s.company_id = $1
       ORDER BY s.created_at DESC`,
      [company_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message
    });
  }
}

async function getSaleById(req, res) {
  try {
    const { id } = req.params;

    const saleResult = await pool.query(
      `SELECT s.*, c.name AS customer_name
       FROM sales s
       LEFT JOIN customers c ON c.id = s.customer_id
       INNER JOIN companies co ON co.id = s.company_id
       WHERE s.id = $1 AND co.user_id = $2`,
      [id, req.user.id]
    );

    if (saleResult.rows.length === 0) {
      return res.status(404).json({
        message: "Venda não encontrada."
      });
    }

    const itemsResult = await pool.query(
      `SELECT si.*, p.name AS product_name
       FROM sale_items si
       INNER JOIN products p ON p.id = si.product_id
       WHERE si.sale_id = $1`,
      [id]
    );

    res.json({
      sale: saleResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message
    });
  }
}

module.exports = {
  createSale,
  listSales,
  getSaleById
};