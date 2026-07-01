const pool = require("../config/database");

async function getReportsSummary(req, res) {
  try {
    const { company_id, start_date, end_date } = req.query;

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

    const filters = ["s.company_id = $1"];
    const values = [company_id];

    if (start_date) {
      values.push(start_date);
      filters.push(`DATE(s.created_at) >= $${values.length}`);
    }

    if (end_date) {
      values.push(end_date);
      filters.push(`DATE(s.created_at) <= $${values.length}`);
    }

    const whereClause = filters.join(" AND ");

    const summaryResult = await pool.query(
      `SELECT
          COUNT(DISTINCT s.id) AS total_sales,
          COALESCE(SUM(si.subtotal), 0) AS total_revenue,
          COALESCE(SUM(si.total_cost), 0) AS total_cost,
          COALESCE(SUM(si.profit), 0) AS gross_profit
       FROM sales s
       LEFT JOIN sale_items si ON si.sale_id = s.id
       WHERE ${whereClause}`,
      values
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
       WHERE ${whereClause}
       GROUP BY s.id, c.name
       ORDER BY s.created_at DESC`,
      values
    );

    const paymentResult = await pool.query(
      `SELECT
          COALESCE(s.payment_method, 'Não informado') AS payment_method,
          COUNT(DISTINCT s.id) AS quantity,
          COALESCE(SUM(si.subtotal), 0) AS revenue
       FROM sales s
       LEFT JOIN sale_items si ON si.sale_id = s.id
       WHERE ${whereClause}
       GROUP BY s.payment_method
       ORDER BY revenue DESC`,
      values
    );

    const topProductsResult = await pool.query(
      `SELECT
          p.id,
          p.name,
          COALESCE(SUM(si.quantity), 0) AS quantity_sold,
          COALESCE(SUM(si.subtotal), 0) AS revenue,
          COALESCE(SUM(si.profit), 0) AS profit
       FROM sale_items si
       INNER JOIN sales s ON s.id = si.sale_id
       INNER JOIN products p ON p.id = si.product_id
       WHERE ${whereClause}
       GROUP BY p.id, p.name
       ORDER BY SUM(si.quantity) DESC, SUM(si.subtotal) DESC
       LIMIT 10`,
      values
    );

    const dailyResult = await pool.query(
      `SELECT
          DATE(s.created_at) AS day,
          COUNT(DISTINCT s.id) AS total_sales,
          COALESCE(SUM(si.subtotal), 0) AS revenue,
          COALESCE(SUM(si.profit), 0) AS profit
       FROM sales s
       LEFT JOIN sale_items si ON si.sale_id = s.id
       WHERE ${whereClause}
       GROUP BY DATE(s.created_at)
       ORDER BY day ASC`,
      values
    );

    const summary = summaryResult.rows[0];

    const totalRevenue = Number(summary.total_revenue);
    const totalCost = Number(summary.total_cost);
    const grossProfit = Number(summary.gross_profit);
    const totalSales = Number(summary.total_sales);

    const profitMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    res.json({
      filters: {
        company_id: Number(company_id),
        start_date: start_date || null,
        end_date: end_date || null,
      },
      summary: {
        total_sales: totalSales,
        total_revenue: totalRevenue,
        total_cost: totalCost,
        gross_profit: grossProfit,
        profit_margin: profitMargin,
        average_ticket: averageTicket,
      },
      sales: salesResult.rows,
      payments: paymentResult.rows,
      top_products: topProductsResult.rows,
      daily: dailyResult.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  getReportsSummary,
};