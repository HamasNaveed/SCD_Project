const express = require('express');
const db = require('./db');
require('dotenv').config();
require('./events/logger');

const app = express();
app.use(express.json());

// Initialize DB
(async () => {
  console.log("🚀 Initializing NodeVault Database...");
  await db.initializeDatabase();
})();

// --- ROUTES ---

// 1. Add Record
app.post("/records", (req, res) => {
  const { name, value } = req.body;
  const record = db.addRecord({ name, value });
  res.json({ message: "Record added", record });
});

// 2. List Records
app.get("/records", (req, res) => {
  res.json(db.listRecords());
});

// 3. Update Record
app.put("/records/:id", (req, res) => {
  const updated = db.updateRecord(
    Number(req.params.id),
    req.body.name,
    req.body.value
  );
  res.json({ updated });
});

// 4. Delete Record
app.delete("/records/:id", (req, res) => {
  const deleted = db.deleteRecord(Number(req.params.id));
  res.json({ deleted });
});

// 5. Search
app.get("/search", (req, res) => {
  const keyword = req.query.q || "";
  res.json(db.searchRecords(keyword));
});

// 6. Sort
app.get("/sort", (req, res) => {
  const field = req.query.field || "id";
  const order = req.query.order || "asc";
  res.json(db.sortRecords(field, order));
});

// 7. Export
app.get("/export", (req, res) => {
  try {
    const path = db.exportToFile();
    res.json({ message: "Exported", file: path });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Stats
app.get("/stats", (req, res) => {
  res.json(db.getVaultStatistics());
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 NodeVault API running at http://localhost:${PORT}`));
