const pool = require("../config/database");

async function stockEntry(req, res) {
    const client = await pool.connect();

    try {
        const { company_id, product_id, quantity, reason } = req.body;

        if (!company_id || !product_id || !quantity) {
            return res.status(400).json({
                message: "Empresa, produto e quantidade são obrigatórios."
            });
        }

        const productCheck = await client.query(
            `SELECT p.id
             FROM products p
             INNER JOIN companies c ON c.id = p.company_id
             WHERE p.id = $1 AND p.company_id = $2 AND c.user_id = $3`,
            [product_id, company_id, req.user.id]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Produto não encontrado ou sem permissão."
            });
        }

        await client.query("BEGIN");

        await client.query(
            `UPDATE products
             SET stock_quantity = stock_quantity + $1
             WHERE id = $2`,
            [quantity, product_id]
        );

        const result = await client.query(
            `INSERT INTO stock_movements (company_id, product_id, type, quantity, reason)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [company_id, product_id, "entry", quantity, reason || "Entrada manual"]
        );

        await client.query("COMMIT");

        res.status(201).json(result.rows[0]);
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

async function stockExit(req, res) {
    const client = await pool.connect();

    try {
        const { company_id, product_id, quantity, reason } = req.body;

        if (!company_id || !product_id || !quantity) {
            return res.status(400).json({
                message: "Empresa, produto e quantidade são obrigatórios."
            });
        }

        const productCheck = await client.query(
            `SELECT p.id, p.name, p.stock_quantity
             FROM products p
             INNER JOIN companies c ON c.id = p.company_id
             WHERE p.id = $1 AND p.company_id = $2 AND c.user_id = $3`,
            [product_id, company_id, req.user.id]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Produto não encontrado ou sem permissão."
            });
        }

        const product = productCheck.rows[0];

        if (product.stock_quantity < quantity) {
            return res.status(400).json({
                message: `Estoque insuficiente para o produto: ${product.name}`
            });
        }

        await client.query("BEGIN");

        await client.query(
            `UPDATE products
             SET stock_quantity = stock_quantity - $1
             WHERE id = $2`,
            [quantity, product_id]
        );

        const result = await client.query(
            `INSERT INTO stock_movements (company_id, product_id, type, quantity, reason)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [company_id, product_id, "exit", quantity, reason || "Saída manual"]
        );

        await client.query("COMMIT");

        res.status(201).json(result.rows[0]);
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

async function listStockMovements(req, res) {
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
            `SELECT sm.*, p.name AS product_name
             FROM stock_movements sm
             INNER JOIN products p ON p.id = sm.product_id
             WHERE sm.company_id = $1
             ORDER BY sm.created_at DESC`,
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

module.exports = {
    stockEntry,
    stockExit,
    listStockMovements
};