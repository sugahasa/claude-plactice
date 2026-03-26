# ShopDemo - テスト用ECサイト

Node.js + Express + SQLite によるバックエンドAPIを持つシンプルなECサイトのデモです。

## 技術スタック

- **バックエンド**: Node.js, Express, better-sqlite3
- **フロントエンド**: HTML / CSS / Vanilla JS（fetch API）
- **DB**: SQLite（`shop.db` ファイルに自動生成）

## セットアップ

```bash
npm install
npm start
```

ブラウザで `http://localhost:3000` を開いてください。

## API エンドポイント

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/products` | 商品一覧取得 |
| GET | `/api/products/:id` | 商品詳細取得 |
| POST | `/api/orders` | 注文作成 |
| GET | `/api/orders` | 注文一覧（管理用） |

## ファイル構成

| ファイル | 役割 |
|---|---|
| `server.js` | Expressサーバー・APIルート |
| `db.js` | SQLiteセットアップ・初期データ投入 |
| `index.html` | 商品一覧ページ |
| `cart.html` | カート・チェックアウトページ |
| `app.js` | フロントエンドロジック（APIからデータ取得） |
| `style.css` | スタイル |
