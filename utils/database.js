const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "ammad",
  database: "node-complete",
  password: "12345678",
});

module.exports = pool.promise();
