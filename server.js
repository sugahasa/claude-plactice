const express = require("express");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname)); // HTML/CSS/JSを静的配信

// --- 商品API ---

// 商品一覧
app.get("/api/products", (req, res) => {
  const products = db.prepare("SELECT * FROM products").all();
  res.json(products);
});

// 商品詳細
app.get("/api/products/:id", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "商品が見つかりません" });
  res.json(product);
});

// --- 注文API ---

// 注文作成
app.post("/api/orders", (req, res) => {
  const { name, email, address, items } = req.body;

  if (!name || !email || !address || !items?.length) {
    return res.status(400).json({ error: "必須項目が不足しています" });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const orderCode = "ORD-" + Date.now().toString(36).toUpperCase();

  const insertOrder = db.prepare(
    "INSERT INTO orders (order_code, name, email, address, total) VALUES (?, ?, ?, ?, ?)"
  );
  const insertItem = db.prepare(
    "INSERT INTO order_items (order_id, product_id, product_name, price, qty) VALUES (?, ?, ?, ?, ?)"
  );

  const create = db.transaction(() => {
    const result = insertOrder.run(orderCode, name, email, address, total);
    const orderId = result.lastInsertRowid;
    for (const item of items) {
      insertItem.run(orderId, item.id, item.name, item.price, item.qty);
    }
    return orderId;
  });

  const orderId = create();
  res.status(201).json({ orderId, orderCode, total });
});

// 注文一覧（管理用）
app.get("/api/orders", (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, GROUP_CONCAT(i.product_name || ' x' || i.qty) as items_summary
    FROM orders o
    LEFT JOIN order_items i ON o.id = i.order_id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `).all();
  res.json(orders);
});

app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
