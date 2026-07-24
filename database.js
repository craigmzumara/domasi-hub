const {pull, Connection} = require("pg");
require('dotenv').config();

const pool = new pool({
    ConnectionString: process.env.DATABASE_URL,
    ssl:{
        rejectUnauthorized: false //required by render
    }
})
module.exports = pool;