const express = require(class="tok-string">'express');
const router = express.Router();
const { pool } = require(class="tok-string">'../db');
 
class=class="tok-string">"tok-comment">// GET /api/orders — list orders, optionally filter by status
router.get(class="tok-string">'/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = class="tok-string">`
      SELECT o.id, o.quantity, o.total, o.status, o.created_at,
             p.name AS product_name, p.price AS unit_price
      FROM orders o
      JOIN products p ON p.id = o.product_id
    `;
    const params = [];
 
    if (status) {
      query += class="tok-string">' WHERE o.status = $1';
      params.push(status);
    }
 
    query += class="tok-string">' ORDER BY o.created_at DESC';
 
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(class="tok-string">'Error fetching orders:', err);
    res.status(500).json({ error: class="tok-string">'Internal server error' });
  }
});
 
class=class="tok-string">"tok-comment">// GET /api/orders/:id — single order detail
router.get(class="tok-string">'/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      class="tok-string">`SELECT o.*, p.name AS product_name
       FROM orders o JOIN products p ON p.id = o.product_id
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: class="tok-string">'Order not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: class="tok-string">'Internal server error' });
  }
});
 
module.exports = router;
