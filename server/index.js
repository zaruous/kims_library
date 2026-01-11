import express from 'express';
import cors from 'cors';
import db from './database.js'; // Note the .js extension is required in ESM

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get all files
app.get('/api/files', (req, res) => {
  const sql = "SELECT * FROM files";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    
    const fileSystem = {};
    const childrenMap = {};

    rows.forEach(row => {
      fileSystem[row.id] = {
        id: row.id,
        parentId: row.parentId,
        name: row.name,
        type: row.type,
        content: row.content,
        lastModified: row.lastModified,
        isOpen: row.id === 'root',
        children: [] 
      };

      if (row.parentId) {
        if (!childrenMap[row.parentId]) {
          childrenMap[row.parentId] = [];
        }
        childrenMap[row.parentId].push(row.id);
      }
    });

    Object.keys(childrenMap).forEach(parentId => {
      if (fileSystem[parentId]) {
        fileSystem[parentId].children = childrenMap[parentId];
      }
    });

    res.json({
      message: "success",
      data: fileSystem
    });
  });
});

// Create new file
app.post('/api/files', (req, res) => {
  const { id, parentId, name, type, content, lastModified } = req.body;
  const sql = `INSERT INTO files (id, parentId, name, type, content, lastModified) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [id, parentId, name, type, content, lastModified];
  
  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      message: "success",
      data: req.body
    });
  });
});

// Update file
app.put('/api/files/:id', (req, res) => {
  const { name, content, lastModified, parentId } = req.body;
  const id = req.params.id;
  
  let sql = "UPDATE files SET lastModified = ?";
  let params = [Date.now()];

  if (name !== undefined) {
    sql += ", name = ?";
    params.push(name);
  }
  if (content !== undefined) {
    sql += ", content = ?";
    params.push(content);
  }
  if (parentId !== undefined) {
    sql += ", parentId = ?";
    params.push(parentId);
  }

  sql += " WHERE id = ?";
  params.push(id);

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      message: "success",
      changes: this.changes
    });
  });
});

// Delete file
app.delete('/api/files/:id', (req, res) => {
  const id = req.params.id;
  
  // Recursive deletion logic should ideally be here, or handled by client
  // Using the simple delete for now as per previous implementation
  const deleteSql = `DELETE FROM files WHERE id = ?`; // Simplified for now, recursive logic needs CTE support check

  db.run(deleteSql, id, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({ message: "deleted", changes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});