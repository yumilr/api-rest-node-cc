const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 3000;

app.use(express.json());

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) return console.error(err.message);
  console.log("🟢 Conectado a la base de datos SQLite");
});


db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )
  `);
    
  db.run(
    `INSERT OR IGNORE INTO users (id, name, email) VALUES (1, 'Juan Pérez', 'juan@example.com')`
  );
  db.run(
    `INSERT OR IGNORE INTO users (id, name, email) VALUES (2, 'Ana Gómez', 'ana@example.com')`
  );
});

//GET 
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET por ID
app.get("/users/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(row);
  });
});

//POST 
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  db.run(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, email });
    }
  );
});

//PUT
app.put("/users/:id", (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;
  db.run(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ message: "Usuario no encontrado" });
      res.json({ message: "Usuario actualizado correctamente" });
    }
  );
});

//DELETE usuario
app.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
