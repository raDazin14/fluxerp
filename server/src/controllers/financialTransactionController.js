const pool = require("../config/database");

async function createTransaction(req, res) {
  try {
    const {
      company_id,
      type,
      status,
      description,
      category,
      amount,
      due_date,
      paid_at,
      notes,
    } = req.body;

    if (
      !company_id ||
      !description ||
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return res.status(400).json({
        message: "Empresa, descrição e valor são obrigatórios.",
      });
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Informe um valor válido.",
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

    const transactionType = type || "expense";
    const transactionStatus = status || "pending";

    const paymentDate =
      transactionStatus === "paid"
        ? paid_at || new Date().toISOString().slice(0, 10)
        : null;

    const result = await pool.query(
      `INSERT INTO financial_transactions
       (
        company_id,
        type,
        status,
        description,
        category,
        amount,
        due_date,
        paid_at,
        notes
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        company_id,
        transactionType,
        transactionStatus,
        description,
        category || null,
        numericAmount,
        due_date || null,
        paymentDate,
        notes || null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar lançamento financeiro:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function listTransactions(req, res) {
  try {
    const { company_id, status, type } = req.query;

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

    const filters = ["company_id = $1"];
    const values = [company_id];

    if (status) {
      values.push(status);
      filters.push(`status = $${values.length}`);
    }

    if (type) {
      values.push(type);
      filters.push(`type = $${values.length}`);
    }

    const result = await pool.query(
      `SELECT *
       FROM financial_transactions
       WHERE ${filters.join(" AND ")}
       ORDER BY 
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
        due_date ASC,
        created_at DESC`,
      values
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar financeiro:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function updateTransaction(req, res) {
  try {
    const { id } = req.params;

    const {
      type,
      status,
      description,
      category,
      amount,
      due_date,
      paid_at,
      notes,
    } = req.body;

    if (
      !description ||
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return res.status(400).json({
        message: "Descrição e valor são obrigatórios.",
      });
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Informe um valor válido.",
      });
    }

    const transactionCheck = await pool.query(
      `SELECT ft.id
       FROM financial_transactions ft
       INNER JOIN companies c ON c.id = ft.company_id
       WHERE ft.id = $1 AND c.user_id = $2`,
      [id, req.user.id]
    );

    if (transactionCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Lançamento financeiro não encontrado.",
      });
    }

    const transactionStatus = status || "pending";

    const paymentDate =
      transactionStatus === "paid"
        ? paid_at || new Date().toISOString().slice(0, 10)
        : null;

    const result = await pool.query(
      `UPDATE financial_transactions
       SET type = $1,
           status = $2,
           description = $3,
           category = $4,
           amount = $5,
           due_date = $6,
           paid_at = $7,
           notes = $8
       WHERE id = $9
       RETURNING *`,
      [
        type || "expense",
        transactionStatus,
        description,
        category || null,
        numericAmount,
        due_date || null,
        paymentDate,
        notes || null,
        id,
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar lançamento financeiro:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function markAsPaid(req, res) {
  try {
    const { id } = req.params;

    const transactionCheck = await pool.query(
      `SELECT ft.id
       FROM financial_transactions ft
       INNER JOIN companies c ON c.id = ft.company_id
       WHERE ft.id = $1 AND c.user_id = $2`,
      [id, req.user.id]
    );

    if (transactionCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Lançamento financeiro não encontrado.",
      });
    }

    const result = await pool.query(
      `UPDATE financial_transactions
       SET status = 'paid',
           paid_at = CURRENT_DATE
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao marcar como pago:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    const transactionCheck = await pool.query(
      `SELECT ft.id
       FROM financial_transactions ft
       INNER JOIN companies c ON c.id = ft.company_id
       WHERE ft.id = $1 AND c.user_id = $2`,
      [id, req.user.id]
    );

    if (transactionCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Lançamento financeiro não encontrado.",
      });
    }

    await pool.query("DELETE FROM financial_transactions WHERE id = $1", [id]);

    return res.json({
      message: "Lançamento excluído com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir lançamento financeiro:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getFinancialSummary(req, res) {
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
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
        COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'paid' THEN amount ELSE 0 END), 0) AS paid_expenses,
        COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'pending' THEN amount ELSE 0 END), 0) AS pending_expenses,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_incomes,
        COALESCE(SUM(CASE WHEN type = 'income' AND status = 'paid' THEN amount ELSE 0 END), 0) AS paid_incomes,
        COALESCE(SUM(CASE WHEN type = 'income' AND status = 'pending' THEN amount ELSE 0 END), 0) AS pending_incomes
       FROM financial_transactions
       WHERE company_id = $1`,
      [company_id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar resumo financeiro:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  createTransaction,
  listTransactions,
  updateTransaction,
  markAsPaid,
  deleteTransaction,
  getFinancialSummary,
};