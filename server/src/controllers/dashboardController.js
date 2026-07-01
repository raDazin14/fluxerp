const pool = require("../config/database");

async function getDashboard(req, res) {
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

        const totalProducts = await pool.query(
            "SELECT COUNT(*) FROM products WHERE company_id = $1",
            [company_id]
        );

        const totalCustomers = await pool.query(
            "SELECT COUNT(*) FROM customers WHERE company_id = $1",
            [company_id]
        );

        const totalSales = await pool.query(
            "SELECT COUNT(*) FROM sales WHERE company_id = $1",
            [company_id]
        );

        const totalRevenue = await pool.query(
            "SELECT COALESCE(SUM(total), 0) AS total FROM sales WHERE company_id = $1",
            [company_id]
        );

        const lowStockProducts = await pool.query(
            `SELECT id, name, stock_quantity, min_stock
             FROM products
             WHERE company_id = $1
             AND stock_quantity <= min_stock
             ORDER BY stock_quantity ASC`,
            [company_id]
        );

        res.json({
            total_products: Number(totalProducts.rows[0].count),
            total_customers: Number(totalCustomers.rows[0].count),
            total_sales: Number(totalSales.rows[0].count),
            total_revenue: Number(totalRevenue.rows[0].total),
            low_stock_products: lowStockProducts.rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {
    getDashboard
};