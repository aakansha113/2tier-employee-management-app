const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
});

function waitForDB(retries = 30) {
  const tryConnect = () => {
    pool.getConnection((err, conn) => {
      if (!err) {
        console.log("✅ MySQL Connected Successfully");
        return conn.release();
      }

      if (retries <= 0) {
        console.log("❌ DB Connection Failed Permanently");
        return;
      }

      console.log("⏳ Waiting for MySQL... retries left:", retries);
      retries--;

      setTimeout(tryConnect, 3000);
    });
  };

  tryConnect();
}

waitForDB();

module.exports = pool;
