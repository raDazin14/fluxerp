const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET || "fluxerp_secret_dev",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

async function register(req, res) {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nome, e-mail e senha são obrigatórios.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "A senha precisa ter pelo menos 6 caracteres.",
      });
    }

    const userExists = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({
        message: "E-mail já cadastrado.",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users(name, email, password)
       VALUES($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, hash]
    );

    const user = result.rows[0];
    const token = createToken(user);

    return res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);

    return res.status(500).json({
      message: "Erro ao criar conta.",
    });
  }
}

async function login(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Informe e-mail e senha.",
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    const token = createToken(user);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      message: "Erro ao fazer login.",
    });
  }
}

async function me(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Usuário não encontrado.",
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    return res.status(500).json({
      message: "Erro ao buscar usuário.",
    });
  }
}

module.exports = {
  register,
  login,
  me,
};