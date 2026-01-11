import db from './database.js';

console.log("Starting DB Test...");

setTimeout(() => {
  console.log("Checking DB Content...");
  
  db.get("SELECT * FROM files WHERE id = 'root'", (err, row) => {
    if (err) {
      console.error("FAIL: Error querying root:", err.message);
      process.exit(1);
    }
    
    if (row && row.id === 'root') {
      console.log("PASS: Root node found.");
    } else {
      console.error("FAIL: Root node not found.");
      process.exit(1);
    }

    const testId = 'test-' + Date.now();
    db.run("INSERT INTO files (id, parentId, name, type) VALUES (?, 'root', 'Test File', 'MARKDOWN')", [testId], function(err) {
      if (err) {
        console.error("FAIL: Insert failed:", err.message);
        process.exit(1);
      }
      console.log("PASS: Test node inserted.");

      db.run("DELETE FROM files WHERE id = ?", [testId], (err) => {
        if (err) console.error("Warning: Cleanup failed");
        console.log("Test Complete.");
        process.exit(0);
      });
    });
  });
}, 1000);