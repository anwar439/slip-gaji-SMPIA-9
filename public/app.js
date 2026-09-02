const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Root & Health check for cPanel availability tester
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', app: 'slip gaji id SMPI Al Azhar 9' });
});

// Serve static assets with permissive cache headers
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/slipgaji_smpia9/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(__dirname));
app.use('/slipgaji_smpia9', express.static(__dirname));

// Send index.html for all other routes
app.use((req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200).sendFile(indexPath);
  } else {
    res.status(200).send('<html><body><h1>Slip Gaji SMPI Al Azhar 9</h1><p>Application is loading...</p></body></html>');
  }
});

// Start listening (Passenger in cPanel binds automatically)
if (typeof(PhusionPassenger) !== 'undefined') {
  app.listen('passenger');
} else {
  app.listen(PORT, () => {
    console.log(`Server slip gaji SMPI Al Azhar 9 is running on port ${PORT}`);
  });
}

module.exports = app;


