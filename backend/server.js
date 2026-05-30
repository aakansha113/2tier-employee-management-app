/* Add Employee */
app.post("/employees", (req, res) => {
  console.log("➕ Adding new employee");

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

    console.log("✅ Employee added with ID:", result.insertId);

    res.json({
      status: "SUCCESS",
      message: "Employee added successfully",
      employeeId: result.insertId
    });
  });
});
