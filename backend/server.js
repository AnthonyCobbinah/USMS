const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Added to check if folders exist

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL is missing!");
  process.exit(1);
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});

// 2. API Routes (Always keep these at the top)
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running', timestamp: new Date() });
});

// 3. Robust Static File Serving
// This looks for the frontend build folder relative to this file
const buildPath = path.join(__dirname, '..', 'frontend', 'build');

if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  
  // The "Catch-all" to serve index.html for React routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  console.log("✅ Frontend build detected and serving.");
} else {
  console.warn("⚠️ Frontend build folder not found at:", buildPath);
  app.get('/', (req, res) => {
    res.send("Backend is live, but Frontend build is missing. Check your Build Command.");
  });
}

// 4. Start Server
const PORT = process.env.PORT || 10000;
sequelize.sync()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch(err => console.error('❌ DB Error:', err));
