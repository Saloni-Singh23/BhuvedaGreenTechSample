const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '.')));

// Database setup
const db = new sqlite3.Database('contacts.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      service TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'new'
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Database table initialized successfully');
    }
  });
}

// Routes

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'page1.html'));
});

// Submit contact form
app.post('/api/contact', (req, res) => {
  const { name, email, phone, company, service, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message || !service) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address'
    });
  }

  // Insert into database
  db.run(
    `INSERT INTO contacts (name, email, phone, company, service, subject, message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone || '', company || '', service, subject, message],
    function(err) {
      if (err) {
        console.error('Error inserting contact:', err);
        return res.status(500).json({
          success: false,
          message: 'Error saving contact. Please try again.'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Contact saved successfully!',
        id: this.lastID
      });

      console.log(`New contact added - ID: ${this.lastID}, Name: ${name}, Email: ${email}`);
    }
  );
});

// Get all contacts (for admin dashboard - you can add authentication later)
app.get('/api/contacts', (req, res) => {
  db.all(
    `SELECT * FROM contacts ORDER BY timestamp DESC`,
    (err, rows) => {
      if (err) {
        console.error('Error fetching contacts:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching contacts'
        });
      }

      res.status(200).json({
        success: true,
        data: rows,
        count: rows.length
      });
    }
  );
});

// Get specific contact by ID
app.get('/api/contacts/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT * FROM contacts WHERE id = ?`,
    [id],
    (err, row) => {
      if (err) {
        console.error('Error fetching contact:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching contact'
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.status(200).json({
        success: true,
        data: row
      });
    }
  );
});

// Update contact status
app.put('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }

  db.run(
    `UPDATE contacts SET status = ? WHERE id = ?`,
    [status, id],
    function(err) {
      if (err) {
        console.error('Error updating contact:', err);
        return res.status(500).json({
          success: false,
          message: 'Error updating contact'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Contact status updated successfully'
      });
    }
  );
});

// Delete contact
app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    `DELETE FROM contacts WHERE id = ?`,
    [id],
    function(err) {
      if (err) {
        console.error('Error deleting contact:', err);
        return res.status(500).json({
          success: false,
          message: 'Error deleting contact'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Contact deleted successfully'
      });
    }
  );
});

// Get contact statistics
app.get('/api/statistics', (req, res) => {
  db.all(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_contacts,
      SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed_contacts,
      SUM(CASE WHEN status = 'responded' THEN 1 ELSE 0 END) as responded_contacts
     FROM contacts`,
    (err, row) => {
      if (err) {
        console.error('Error fetching statistics:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching statistics'
        });
      }

      res.status(200).json({
        success: true,
        data: row[0]
      });
    }
  );
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Bhuveda GreenTech Server running on http://localhost:${PORT}`);
  console.log(`📧 Contact Form API: http://localhost:${PORT}/api/contact`);
  console.log(`📋 View all contacts: http://localhost:${PORT}/api/contacts\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Closing database connection...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
