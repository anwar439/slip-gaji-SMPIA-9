const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from current directory
app.use(express.static(__dirname));

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'slip gaji id SMPI Al Azhar 9' });
});

// SPA fallback for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server slip gaji SMPI Al Azhar 9 is running on port ${PORT}`);
});

module.exports = app;
