const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');

dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
// Compress all responses (gzip/deflate) — shrinks JSON by ~70%
app.use(compression());

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));

// Cache static data hints (boards list can be cached briefly)
app.use((req, res, next) => {
  // For GET requests, add a light cache hint (no-store for data that changes)
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/boards',    require('./routes/boards'));
app.use('/api/lists',     require('./routes/lists'));
app.use('/api/cards',     require('./routes/cards'));
app.use('/api/labels',    require('./routes/labels'));
app.use('/api/checklist', require('./routes/checklist'));
app.use('/api/members',   require('./routes/members'));
app.use('/api/comments',  require('./routes/comments'));
app.use('/api/search',    require('./routes/search'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), demoMode: process.env.DEMO_MODE === 'true' });
});

// ─── Manual Reset (demo only) ─────────────────────────────────────────────────
app.post('/api/reset', async (req, res) => {
  if (process.env.DEMO_MODE !== 'true') {
    return res.status(403).json({ error: 'Reset only available in demo mode' });
  }
  try {
    const { reseedDemo } = require('./lib/auto-reset');
    await reseedDemo();
    res.json({ message: 'Database reset and reseeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', req.method, req.path, err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const prisma = require('./lib/prisma');
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const { startAutoReset } = require('./lib/auto-reset');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  startAutoReset(); // Start hourly DB reset if DEMO_MODE=true
});
