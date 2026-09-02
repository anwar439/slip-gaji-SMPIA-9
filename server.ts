import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

const staticDir = process.cwd();
app.use(express.static(staticDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'slip gaji id SMPI Al Azhar 9' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server slip gaji id SMPI Al Azhar 9 running on port ${PORT}`);
});
