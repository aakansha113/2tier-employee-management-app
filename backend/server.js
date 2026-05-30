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

/* Get All Employees */
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

/* Start Server */
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
