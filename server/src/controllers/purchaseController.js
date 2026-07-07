const pool = require("../config/database");

async function createPurchase(req, res) {
  const client = await pool.connect();

  try {
    const {
      company_id,
      product_id,
      supplier_name,
      purchase_date,
      quantity,
      unit,
      unit_price,
      total_price,
      notes,
    } = req.body;

    if (!company_id || !product_id || !quantity) {
      return res.status(400).json({
        message: "Empresa, produto e quantidade são obrigatórios.",
      });
    }

    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = Number(unit_price || 0);
    const parsedTotal =
      total_price !== undefined && total_price !== null && total_price !== ""
        ? Number(total_price)
        : parsedQuantity * parsedUnitPrice;

    if (parsedQuantity <= 0) {
      return res.status(400).json({
        message: "A quantidade precisa ser maior que zero.",
      });
    }

    const productCheck = await client.query(
      `SELECT p.id, p.name
       FROM products p
       INNER JOIN companies c ON c.id = p.company_id
       WHERE p.id = $1 AND p.company_id = $2 AND c.user_id = $3`,
      [product_id, company_id, req.user.id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Produto não encontrado ou sem permissão.",
      });
    }

    await client.query("BEGIN");

    const purchaseResult = await client.query(
      `INSERT INTO purchases
       (company_id, product_id, supplier_name, purchase_date, quantity, unit, unit_price, total_price, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        company_id,
        product_id,
        supplier_name || null,
        purchase_date || new Date(),
        parsedQuantity,
        unit || "UN",
        parsedUnitPrice,
        parsedTotal,
        notes || null,
      ]
    );

    await client.query(
      `UPDATE products
       SET stock_quantity = stock_quantity + $1
       WHERE id = $2`,
      [parsedQuantity, product_id]
    );

    await client.query(
      `INSERT INTO stock_movements
       (company_id, product_id, type, quantity, unit, reason)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        company_id,
        product_id,
        "entry",
        parsedQuantity,
        unit || "UN",
        supplier_name
          ? `Compra de ${supplier_name}`
          : "Compra registrada",
      ]
    );

    await client.query("COMMIT");

    return res.status(201).json(purchaseResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao registrar compra:", error);

    return res.status(500).json({
      message: error.message,
    });
  } finally {
    client.release();
  }
}

async function listPurchases(req, res) {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({
        message: "Informe o company_id.",
      });
    }

    const companyCheck = await pool.query(
      "SELECT id FROM companies WHERE id = $1 AND user_id = $2",
      [company_id, req.user.id]
    );

    if (companyCheck.rows.length === 0) {
      return res.status(403).json({
        message: "Empresa não encontrada ou sem permissão.",
      });
    }

    const result = await pool.query(
      `SELECT 
          pu.*,
          p.name AS product_name
       FROM purchases pu
       INNER JOIN products p ON p.id = pu.product_id
       WHERE pu.company_id = $1
       ORDER BY pu.purchase_date DESC, pu.created_at DESC`,
      [company_id]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar compras:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function deletePurchase(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const purchaseCheck = await client.query(
      `SELECT pu.*
       FROM purchases pu
       INNER JOIN companies c ON c.id = pu.company_id
       WHERE pu.id = $1 AND c.user_id = $2`,
      [id, req.user.id]
    );

    if (purchaseCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Compra não encontrada.",
      });
    }

    const purchase = purchaseCheck.rows[0];

    await client.query("BEGIN");

    await client.query(
      `UPDATE products
       SET stock_quantity = stock_quantity - $1
       WHERE id = $2`,
      [purchase.quantity, purchase.product_id]
    );

    await client.query("DELETE FROM purchases WHERE id = $1", [id]);

    await client.query(
      `INSERT INTO stock_movements
       (company_id, product_id, type, quantity, unit, reason)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        purchase.company_id,
        purchase.product_id,
        "exit",
        purchase.quantity,
        purchase.unit || "UN",
        "Cancelamento de compra",
      ]
    );

    await client.query("COMMIT");

    return res.json({
      message: "Compra excluída e estoque ajustado com sucesso.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao excluir compra:", error);

    return res.status(500).json({
      message: error.message,
    });
  } finally {
    client.release();
  }
}

module.exports = {
  createPurchase,
  listPurchases,
  deletePurchase,
};