// カートの状態管理
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("#cartCount").forEach((el) => {
    el.textContent = total;
    el.classList.toggle("has-items", total > 0);
  });
}

function addToCart(productId, name, price) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, name, price, qty: 1 });
  }
  saveCart(cart);
  showToast();
}

function showToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// 商品一覧ページ：APIから取得して描画
async function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  grid.innerHTML = "<p style='color:#6B7280;padding:2rem'>読み込み中...</p>";

  const res = await fetch("/api/products");
  const products = await res.json();

  grid.innerHTML = products.map((p) => `
    <div class="product-card">
      <img src="${p.image}" alt="${p.name}" class="product-img">
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <div class="product-footer">
          <span class="product-price">¥${p.price.toLocaleString()}</span>
          <button class="btn btn-primary btn-sm"
            onclick="addToCart(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.price})">
            カートに追加
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

// カートページ
function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartSummary = document.getElementById("cartSummary");
  const cartEmpty = document.getElementById("cartEmpty");
  if (!cartItems) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartEmpty.style.display = "block";
    cartSummary.style.display = "none";
    cartItems.innerHTML = "";
    return;
  }

  cartEmpty.style.display = "none";
  cartSummary.style.display = "block";

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">¥${item.price.toLocaleString()}</span>
      </div>
      <div class="cart-item-actions">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">＋</button>
        <button class="remove-btn" onclick="removeItem(${item.id})">削除</button>
      </div>
      <div class="cart-item-subtotal">
        小計：¥${(item.price * item.qty).toLocaleString()}
      </div>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("cartTotal").textContent = `¥${total.toLocaleString()}`;
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
  saveCart(cart);
  renderCart();
}

function removeItem(productId) {
  saveCart(getCart().filter((i) => i.id !== productId));
  renderCart();
}

function proceedToCheckout() {
  document.getElementById("cartContent").style.display = "none";
  document.getElementById("checkoutSection").style.display = "block";
  window.scrollTo(0, 0);
}

// 注文をAPIへ送信
async function submitOrder(e) {
  e.preventDefault();
  const form = e.target;
  const cart = getCart();

  const payload = {
    name:    form.name.value,
    email:   form.email.value,
    address: form.zip.value + " " + form.address.value,
    items:   cart,
  };

  const btn = form.querySelector("[type=submit]");
  btn.disabled = true;
  btn.textContent = "送信中...";

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  document.getElementById("checkoutSection").style.display = "none";
  document.getElementById("completeSection").style.display = "block";
  document.getElementById("orderId").textContent = data.orderCode;
  localStorage.removeItem("cart");
  updateCartCount();
  window.scrollTo(0, 0);
}

// 初期化
updateCartCount();
renderProducts();
renderCart();
