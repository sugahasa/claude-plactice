const Database = require("better-sqlite3");

const db = new Database("shop.db");

// テーブル作成
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT NOT NULL,
    price    INTEGER NOT NULL,
    category TEXT NOT NULL,
    image    TEXT NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_code TEXT NOT NULL,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    address    TEXT NOT NULL,
    total      INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    price      INTEGER NOT NULL,
    qty        INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );
`);

// 初期データが未挿入の場合のみシードを実行
const count = db.prepare("SELECT COUNT(*) as c FROM products").get();
if (count.c === 0) {
  const insert = db.prepare(
    "INSERT INTO products (name, price, category, image, description) VALUES (?, ?, ?, ?, ?)"
  );
  const seed = db.transaction(() => {
    insert.run("プレミアム Tシャツ",  3500,  "ファッション", "https://placehold.co/300x300/4F46E5/white?text=T-Shirt",  "高品質コットン使用の定番Tシャツ。");
    insert.run("スニーカー",          12000, "ファッション", "https://placehold.co/300x300/059669/white?text=Sneaker",  "軽量で快適な毎日のスニーカー。");
    insert.run("ワイヤレスイヤホン",  8800,  "電子機器",     "https://placehold.co/300x300/DC2626/white?text=Earphone", "ノイズキャンセリング対応のワイヤレスイヤホン。");
    insert.run("スマートウォッチ",    25000, "電子機器",     "https://placehold.co/300x300/D97706/white?text=Watch",    "健康管理・通知対応のスマートウォッチ。");
    insert.run("ステンレスボトル",    2800,  "生活用品",     "https://placehold.co/300x300/0891B2/white?text=Bottle",   "保温・保冷24時間対応のボトル。");
    insert.run("ノートパッド",        1200,  "文具",         "https://placehold.co/300x300/7C3AED/white?text=Notepad",  "書き心地抜群のA5ノート。");
  });
  seed();
  console.log("データベースに初期データを挿入しました");
}

module.exports = db;
