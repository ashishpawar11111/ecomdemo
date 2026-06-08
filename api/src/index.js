const express = require(class="tok-string">'express');
const cors = require(class="tok-string">'cors');
const { pool, initDB } = require(class="tok-string">'./db');
const productRoutes = require(class="tok-string">'./routes/products');
const orderRoutes = require(class="tok-string">'./routes/orders');
 
const app = express();
const PORT = process.env.PORT || 3000;
 
app.use(cors());
app.use(express.json());
 
class=class="tok-string">"tok-comment">// Health check endpoints
app.get(class="tok-string">'/health', (req, res) => {
  res.json({ status: class="tok-string">'ok', uptime: process.uptime() });
});
 
app.get(class="tok-string">'/health/db', async (req, res) => {
  try {
    const result = await pool.query(class="tok-string">'SELECT NOW()');
    res.json({ status: class="tok-string">'ok', db: result.rows[0].now });
  } catch (err) {
    res.status(503).json({ status: class="tok-string">'error', message: err.message });
  }
});
 
class=class="tok-string">"tok-comment">// Routes
app.use(class="tok-string">'/api/products', productRoutes);
app.use(class="tok-string">'/api/orders', orderRoutes);
 
class=class="tok-string">"tok-comment">// Graceful shutdown
process.on(class="tok-string">'SIGTERM', async () => {
  console.log(class="tok-string">'SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});
 
async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(class="tok-string">`API server running on port ${PORT}`);
  });
}
 
start().catch(err => {
  console.error(class="tok-string">'Failed to start server:', err);
  process.exit(1);
});
 
module.exports = app;
