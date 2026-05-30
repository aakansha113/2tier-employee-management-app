const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check query instead of just connection
function waitForDB(retries = 30) {
  const tryConnect = () => {
    pool.query("SELECT 1", (err) => {
      if (!err) {
        console.log("✅ MySQL Connected Successfully");
        return;
      }

      if (retries <= 0) {
        console.error("❌ DB Connection Failed Permanently");

        // Optional (GOOD for Kubernetes restart)
        process.exit(1);
      }

      console.log(`⏳ Waiting for MySQL... retries left: ${retries}`);
      retries--;

      setTimeout(tryConnect, 3000);
    });
  };

  tryConnect();
}

waitForDB();

module.exports = pool;
