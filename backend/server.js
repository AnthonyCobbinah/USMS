const express = require('express');
const { Sequelize } = require('sequelize');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection (Standard Render Setup)
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL missing from Environment Variables!");
  process.exit(1);
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});

// 2. API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Online', message: 'SMS Backend is running' });
});

// 3. Serve Frontend (Simplified Path)
// Since server.js is now in the root, we look directly into /frontend/build
const buildPath = path.join(__dirname, 'frontend', 'build');

if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  
  // Handle React Routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
  console.log("✅ Serving Frontend from:", buildPath);
} else {
  app.get('/', (req, res) => {
    res.send("Server is LIVE. Note: Frontend build folder not found in /frontend/build");
  });
}

// 4. Start
const PORT = process.env.PORT || 10000;
sequelize.sync().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SMS App active on port ${PORT}`);
  });
});
