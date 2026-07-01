const pool = require("../config/database");

async function createCompany(req, res) {
  try {
    const userId = req.user.id;
    const { name, document, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Nome da empresa é obrigatório." });
    }

    const result = await pool.query(
      `INSERT INTO companies (user_id, name, document, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, name, document || null, phone || null, address || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar empresa:", error);
    return res.status(500).json({ message: "Erro ao criar empresa." });
  }
}

async function listCompanies(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT *
       FROM companies
       WHERE user_id = $1
       ORDER BY id DESC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar empresas:", error);
    return res.status(500).json({ message: "Erro ao listar empresas." });
  }
}

async function updateCompany(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, document, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Nome da empresa é obrigatório." });
    }

    const companyCheck = await pool.query(
      `SELECT id FROM companies WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (companyCheck.rows.length === 0) {
      return res.status(404).json({ message: "Empresa não encontrada." });
    }

    const result = await pool.query(
      `UPDATE companies
       SET name = $1, document = $2, phone = $3, address = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [name, document || null, phone || null, address || null, id, userId]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    return res.status(500).json({ message: "Erro ao atualizar empresa." });
  }
}

async function deleteCompany(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const companyCheck = await pool.query(
      `SELECT id FROM companies WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (companyCheck.rows.length === 0) {
      return res.status(404).json({ message: "Empresa não encontrada." });
    }

    await pool.query(
      `DELETE FROM companies WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    return res.json({ message: "Empresa excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir empresa:", error);
    return res.status(500).json({
      message:
        "Não foi possível excluir. Essa empresa pode ter produtos, clientes ou vendas vinculados.",
    });
  }
}

module.exports = {
  createCompany,
  listCompanies,
  updateCompany,
  deleteCompany,
};