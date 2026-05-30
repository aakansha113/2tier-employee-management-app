const express = require("express");
const db = require("./db");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));

/* LOGGER */
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

/* DB INIT */
function waitForDB(retries = 30) {
  const tryConnect = () => {
    db.query("SELECT 1", (err) => {
      if (!err) {
        console.log("✅ MySQL Connected Successfully");

        db.query(`
          CREATE TABLE IF NOT EXISTS employees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            role VARCHAR(100) NOT NULL,
            email VARCHAR(150),
            phone VARCHAR(20),
            dob DATE
          )
        `);

      } else {
        console.log(`⏳ Waiting for DB... retries left: ${retries}`);

        if (retries === 0) process.exit(1);

        retries--;
        setTimeout(tryConnect, 3000);
      }
    });
  };

  tryConnect();
}

waitForDB();

/* HOME */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* HEALTH */
app.get("/health", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) return res.status(500).json({ status: "DB_ERROR" });
    res.json({ status: "OK" });
  });
});

/* GET + SEARCH */
app.get("/employees", (req, res) => {
  const search = req.query.search;

  let sql = "SELECT * FROM employees";
  let params = [];

  if (search) {
    sql = `
      SELECT * FROM employees
      WHERE id = ? OR name LIKE ? OR role LIKE ?
    `;
    params = [search, `%${search}%`, `%${search}%`];
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

/* ADD */
app.post("/employees", (req, res) => {
  const { name, role, email, phone, dob } = req.body;

  if (!name || !role) {
    return res.status(400).json({ message: "Name & Role required" });
  }

  db.query(
    `INSERT INTO employees (name, role, email, phone, dob)
     VALUES (?, ?, ?, ?, ?)`,
    [name, role, email, phone, dob],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Added", id: result.insertId });
    }
  );
});

/* DELETE */
app.delete("/employees/:id", (req, res) => {
  db.query(
    "DELETE FROM employees WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Deleted" });
    }
  );
});

/* START */
app.listen(3000, () => {
  console.log("🚀 Server running on 3000");
});
