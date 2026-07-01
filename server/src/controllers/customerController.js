const pool = require("../config/database");

async function createCustomer(req, res) {
    try {
        const { company_id, name, email, phone, document, address } = req.body;

        if (!company_id || !name) {
            return res.status(400).json({
                message: "Empresa e nome do cliente são obrigatórios."
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
            `INSERT INTO customers
            (company_id, name, email, phone, document, address)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING *`,
            [company_id, name, email, phone, document, address]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

async function listCustomers(req, res) {
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
            `SELECT * FROM customers
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

async function getCustomerById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT cu.*
             FROM customers cu
             INNER JOIN companies c ON c.id = cu.company_id
             WHERE cu.id = $1 AND c.user_id = $2`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Cliente não encontrado."
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

async function updateCustomer(req, res) {
    try {
        const { id } = req.params;
        const { name, email, phone, document, address } = req.body;

        const customerCheck = await pool.query(
            `SELECT cu.id
             FROM customers cu
             INNER JOIN companies c ON c.id = cu.company_id
             WHERE cu.id = $1 AND c.user_id = $2`,
            [id, req.user.id]
        );

        if (customerCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Cliente não encontrado."
            });
        }

        const result = await pool.query(
            `UPDATE customers
             SET name = $1,
                 email = $2,
                 phone = $3,
                 document = $4,
                 address = $5
             WHERE id = $6
             RETURNING *`,
            [name, email, phone, document, address, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

async function deleteCustomer(req, res) {
    try {
        const { id } = req.params;

        const customerCheck = await pool.query(
            `SELECT cu.id
             FROM customers cu
             INNER JOIN companies c ON c.id = cu.company_id
             WHERE cu.id = $1 AND c.user_id = $2`,
            [id, req.user.id]
        );

        if (customerCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Cliente não encontrado."
            });
        }

        await pool.query(
            "DELETE FROM customers WHERE id = $1",
            [id]
        );

        res.json({
            message: "Cliente excluído com sucesso."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createCustomer,
    listCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};