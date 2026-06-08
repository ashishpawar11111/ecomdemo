const express = require(class="tok-string">'express');
const router = express.Router();
const { pool } = require(class="tok-string">'../db');
 
class=class="tok-string">"tok-comment">// GET /api/products — list all products
router.get(class="tok-string">'/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      class="tok-string">'SELECT id, name, price, stock FROM products ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    console.error(class="tok-string">'Error fetching products:', err);
    res.status(500).json({ error: class="tok-string">'Internal server error' });
  }
});
 
class=class="tok-string">"tok-comment">// POST /api/products/order — place an order (transactional)
router.post(class="tok-string">'/order', async (req, res) => {
  const { productId, quantity } = req.body;
 
  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ error: class="tok-string">'Invalid productId or quantity' });
  }
 
  const client = await pool.connect();
  try {
    await client.query(class="tok-string">'BEGIN');
 
    class=class="tok-string">"tok-comment">// Lock the product row to prevent overselling
    const { rows: products } = await client.query(
      class="tok-string">'SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    );
 
    if (products.length === 0) {
      await client.query(class="tok-string">'ROLLBACK');
      return res.status(404).json({ error: class="tok-string">'Product not found' });
    }
 
    const product = products[0];
    if (product.stock < quantity) {
      await client.query(class="tok-string">'ROLLBACK');
      return res.status(409).json({
        error: class="tok-string">'Insufficient stock',
        available: product.stock,
      });
    }
 
    const total = product.price * quantity;
 
    class=class="tok-string">"tok-comment">// Decrement stock
    await client.query(
      class="tok-string">'UPDATE products SET stock = stock - $1 WHERE id = $2',
      [quantity, productId]
    );
 
    class=class="tok-string">"tok-comment">// Create order
    const { rows: orders } = await client.query(
      class="tok-string">'INSERT INTO orders (product_id, quantity, total, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [productId, quantity, total, class="tok-string">'confirmed']
    );
 
    await client.query(class="tok-string">'COMMIT');
 
    res.status(201).json({
      message: class="tok-string">'Order placed successfully',
      order: orders[0],
    });
  } catch (err) {
    await client.query(class="tok-string">'ROLLBACK');
    console.error(class="tok-string">'Order transaction failed:', err);
    res.status(500).json({ error: class="tok-string">'Order failed' });
  } finally {
    client.release();
  }
});
 
module.exports = router;
