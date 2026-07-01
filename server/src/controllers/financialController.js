const pool = require("../config/database");

async function getFinancialSummary(req, res) {
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

    const summaryResult = await pool.query(
      `SELECT 
          COALESCE(SUM(si.subtotal), 0) AS total_revenue,
          COALESCE(SUM(si.total_cost), 0) AS total_cost,
          COALESCE(SUM(si.profit), 0) AS gross_profit
       FROM sale_items si
       INNER JOIN sales s ON s.id = si.sale_id
       WHERE s.company_id = $1`,
      [company_id]
    );

    const salesResult = await pool.query(
      `SELECT 
          s.id,
          s.created_at,
          s.payment_method,
          c.name AS customer_name,
          COALESCE(SUM(si.subtotal), 0) AS revenue,
          COALESCE(SUM(si.total_cost), 0) AS cost,
          COALESCE(SUM(si.profit), 0) AS profit
       FROM sales s
       LEFT JOIN customers c ON c.id = s.customer_id
       LEFT JOIN sale_items si ON si.sale_id = s.id
       WHERE s.company_id = $1
       GROUP BY s.id, c.name
       ORDER BY s.created_at DESC`,
      [company_id]
    );

    const summary = summaryResult.rows[0];

    const totalRevenue = Number(summary.total_revenue);
    const totalCost = Number(summary.total_cost);
    const grossProfit = Number(summary.gross_profit);

    const profitMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    res.json({
      total_revenue: totalRevenue,
      total_cost: totalCost,
      gross_profit: grossProfit,
      profit_margin: profitMargin,
      sales: salesResult.rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message
    });
  }
}

module.exports = {
  getFinancialSummary
};