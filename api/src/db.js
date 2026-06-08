const { Pool } = require(class="tok-string">'pg');
 
const pool = new Pool({
  host: process.env.DB_HOST || class="tok-string">'localhost',
  database: process.env.DB_NAME || class="tok-string">'ecom',
  user: process.env.DB_USER || class="tok-string">'ecom_user',
  password: process.env.DB_PASSWORD || class="tok-string">'changeme',
  port: parseInt(process.env.DB_PORT || class="tok-string">'5432'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
 
pool.on(class="tok-string">'error', (err) => {
  console.error(class="tok-string">'Unexpected pool error:', err);
  process.exit(-1);
});
 
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(class="tok-string">'BEGIN');
 
    await client.query(class="tok-string">`
      CREATE TABLE IF NOT EXISTS products (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        price      DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        stock      INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
 
    await client.query(class="tok-string">`
      CREATE TABLE IF NOT EXISTS orders (
        id         SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        quantity   INTEGER NOT NULL CHECK (quantity > 0),
        total      DECIMAL(10, 2) NOT NULL,
        status     VARCHAR(50) DEFAULT class="tok-string">'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
 
    class=class="tok-string">"tok-comment">// Seed products if table is empty
    const { rows } = await client.query(class="tok-string">'SELECT COUNT(*) FROM products');
    if (parseInt(rows[0].count) === 0) {
      await client.query(class="tok-string">`
        INSERT INTO products (name, price, stock) VALUES
          (class="tok-string">'Wireless Headphones', 79.99, 150),
          (class="tok-string">'USB-C Hub', 49.99, 200),
          (class="tok-string">'Mechanical Keyboard', 129.99, 75),
          (class="tok-string">'4K Monitor', 349.99, 30),
          (class="tok-string">'Laptop Stand', 39.99, 300)
      `);
    }
 
    await client.query(class="tok-string">'COMMIT');
    console.log(class="tok-string">'Database initialized successfully');
  } catch (err) {
    await client.query(class="tok-string">'ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
 
module.exports = { pool, initDB };
