const pool = require("../config/database");

async function createProduct(req, res) {
    try {
        const {
            company_id,
            name,
            description,
            sku,
            barcode,
            cost_price,
            sale_price,
            stock_quantity,
            min_stock
        } = req.body;

        if (!company_id || !name) {
            return res.status(400).json({
                message: "Empresa e nome do produto são obrigatórios."
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
            `INSERT INTO products 
            (company_id, name, description, sku, barcode, cost_price, sale_price, stock_quantity, min_stock)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`,
            [
                company_id,
                name,
                description,
                sku,
                barcode,
                cost_price || 0,
                sale_price || 0,
                stock_quantity || 0,
                min_stock || 0
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
}

async function listProducts(req, res) {
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
            `SELECT * FROM products 
             WHERE company_id = $1
             ORDER BY created_at DESC`,
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

async function getProductById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT p.*
             FROM products p
             INNER JOIN companies c ON c.id = p.company_id
             WHERE p.id = $1 AND c.user_id = $2`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Produto não encontrado."
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
}

async function updateProduct(req, res) {
    try {
        const { id } = req.params;

        const {
            name,
            description,
            sku,
            barcode,
            cost_price,
            sale_price,
            stock_quantity,
            min_stock
        } = req.body;

        const productCheck = await pool.query(
            `SELECT p.id
             FROM products p
             INNER JOIN companies c ON c.id = p.company_id
             WHERE p.id = $1 AND c.user_id = $2`,
            [id, req.user.id]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Produto não encontrado."
            });
        }

        const result = await pool.query(
            `UPDATE products
             SET name = $1,
                 description = $2,
                 sku = $3,
                 barcode = $4,
                 cost_price = $5,
                 sale_price = $6,
                 stock_quantity = $7,
                 min_stock = $8
             WHERE id = $9
             RETURNING *`,
            [
                name,
                description,
                sku,
                barcode,
                cost_price,
                sale_price,
                stock_quantity,
                min_stock,
                id
            ]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
}

async function deleteProduct(req, res) {
    try {
        const { id } = req.params;

        const productCheck = await pool.query(
            `SELECT p.id
             FROM products p
             INNER JOIN companies c ON c.id = p.company_id
             WHERE p.id = $1 AND c.user_id = $2`,
            [id, req.user.id]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Produto não encontrado."
            });
        }

        await pool.query(
            "DELETE FROM products WHERE id = $1",
            [id]
        );

        res.json({
            message: "Produto excluído com sucesso."
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    createProduct,
    listProducts,
    getProductById,
    updateProduct,
    deleteProduct
};