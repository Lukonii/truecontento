const Pool = require("pg").Pool;
require("dotenv").config();

// local
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DB,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// prod

// dev
// instanceId : tc-db-dev
// pass: l=A2$d~gA'AXp]X*
// db: truecontento
// user: lukav
// userpass: ij|<146-%t\{XAyF

module.exports = pool;
