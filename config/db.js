const pg = require("pg");
require("dotenv").config();

const Pool = pg.Pool;
const pool = new Pool({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    port: 5432,
    // ssl: {
    //     require: true,
    // },
    connectionTimeoutMillis: 100000,
    idleTimeoutMillis: 100000,
});

module.exports = pool;
