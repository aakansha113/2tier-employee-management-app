const express = require("express");
const db = require("./db");

const app = express();

app.use(express.json());

/* 🔥 LIVE REQUEST LOGGER (ADD THIS) */
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - HIT`);
  next();
});

// Health check (VERY IMPORTANT for Kubernetes debugging)
app.get("/", (req, res) => {
  console.log("🏠 Root endpoint accessed");
  res.send("🚀 Successfully Done with - 2 Tier App Running on Kubernetes");
});

// DB test endpoint
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
      message: "DB Connected"
    });
  });
});

// Employees API
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

    console.log(`✅ Returned ${result.length} rows`);

    res.json(result);
  });
});

// Server start
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
