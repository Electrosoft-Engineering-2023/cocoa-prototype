const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

var config = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000,
    statement_timeout: 5000
}

var pool = new Pool(config);

module.exports = pool;