const express = require("express");
const db = require("./db");
const path = require("path");

const app = express();

app.use(express.json());

// Serve static files from public folder
app.use(express.static("public"));

/* Request Logger */
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - HIT`);
  next();
});

/* Home Page */
app.get("/", (req, res) => {
  console.log("🏠 Employee UI Loaded");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* Health Check Endpoint */
app.get("/health", (req, res) => {
  console.log("🔍 DB health check called");

  db.query("SELECT 1", (err) => {
    if (err) {
      console.log("❌ DB ERROR:", err.message);

      return res.status(500).json({
        status: "DB_NOT_READY",
        error: err.message
      });
    }

    console.log("✅ DB Connected Successfully");

    res.json({
      status: "OK",
      message: "DB Connected Successfully"
    });
  });
});

/* =========================
   GET ALL EMPLOYEES
========================= */
app.get("/employees", (req, res) => {
  console.log("📊 Fetching employees from DB");

  db.query("SELECT * FROM employees", (err, result) => {
    if (err) {
      console.log("❌ QUERY ERROR:", err.message);

      return res.status(500).json({
        status: "ERROR",
        message: err.message
      });
    }

    console.log(`✅ Returned ${result.length} employees`);

    res.json(result);
  });
});

/* =========================
   ADD EMPLOYEE (POST)
========================= */
app.post("/employees", (req, res) => {
  console.log("➕ Adding employee");

  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({
      status: "ERROR",
      message: "Name, email, and role are required"
    });
  }

  const sql = "INSERT INTO employees (name, email, role) VALUES (?, ?, ?)";

  db.query(sql, [name, email, role], (err, result) => {
    if (err) {
      console.log("❌ INSERT ERROR:", err.message);

      return res.status(500).json({
        status: "ERROR",
        message: err.message
      });
    }

    console.log("✅ Employee added ID:", result.insertId);

    res.json({
      status: "SUCCESS",
      message: "Employee added",
      employeeId: result.insertId
    });
  });
});

/* =========================
   DELETE EMPLOYEE
========================= */
app.delete("/employees/:id", (req, res) => {
  console.log("🗑️ Deleting employee");

  const employeeId = req.params.id;

  const sql = "DELETE FROM employees WHERE id = ?";

  db.query(sql, [employeeId], (err, result) => {
    if (err) {
      console.log("❌ DELETE ERROR:", err.message);

      return res.status(500).json({
        status: "ERROR",
        message: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "NOT_FOUND",
        message: "Employee not found"
      });
    }

    console.log("✅ Employee deleted ID:", employeeId);

    res.json({
      status: "SUCCESS",
      message: "Employee deleted successfully"
    });
  });
});

/* Start Server */
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
