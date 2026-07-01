const pool = require("../config/database");

async function createCategory(req, res) {
    try {
        const { company_id, name } = req.body;

        if (!company_id || !name) {
            return res.status(400).json({
                message: "Empresa e nome da categoria são obrigatórios."
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
            `INSERT INTO categories (company_id, name)
             VALUES ($1, $2)
             RETURNING *`,
            [company_id, name]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

async function listCategories(req, res) {
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
            `SELECT * FROM categories
             WHERE company_id = $1
             ORDER BY created_at DESC`,
            [company_id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Nome da categoria é obrigatório."
            });
        }

        const categoryCheck = await pool.query(
            `SELECT ca.id
             FROM categories ca
             INNER JOIN companies co ON co.id = ca.company_id
             WHERE ca.id = $1 AND co.user_id = $2`,
            [id, req.user.id]
        );

        if (categoryCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Categoria não encontrada."
            });
        }

        const result = await pool.query(
            `UPDATE categories
             SET name = $1
             WHERE id = $2
             RETURNING *`,
            [name, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

async function deleteCategory(req, res) {
    try {
        const { id } = req.params;

        const categoryCheck = await pool.query(
            `SELECT ca.id
             FROM categories ca
             INNER JOIN companies co ON co.id = ca.company_id
             WHERE ca.id = $1 AND co.user_id = $2`,
            [id, req.user.id]
        );

        if (categoryCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Categoria não encontrada."
            });
        }

        await pool.query(
            "DELETE FROM categories WHERE id = $1",
            [id]
        );

        res.json({
            message: "Categoria excluída com sucesso."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createCategory,
    listCategories,
    updateCategory,
    deleteCategory
};