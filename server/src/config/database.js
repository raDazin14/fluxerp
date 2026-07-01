const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || "fluxerp",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD,
        ssl: isProduction
          ? {
              rejectUnauthorized: false,
            }
          : false,
      }
);

pool
  .connect()
  .then((client) => {
    console.log("✅ Banco conectado");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar no banco:", err.message);
  });

module.exports = pool;