/* ═══════════════════════════════════════════════════════════════
   Yamamah Eats — app.js
   UI logic: state management, rendering, event handlers
   Depends on:  data.js  (RESTAURANTS, MENUS, SEED_ORDERS, SEED_USERS)
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* ─── Helpers ──────────────────────────────────────────────── */
const fmt = (n) => `SAR ${Number(n).toFixed(2)}`;

function el(tag, props, ...children) {
  const elem = document.createElement(tag);
  if (props) {
    Object.entries(props).forEach(([k, v]) => {
      if (k === "className")        elem.className = v;
      else if (k === "style")       Object.assign(elem.style, v);
      else if (k.startsWith("on")) elem.addEventListener(k.slice(2).toLowerCase(), v);
      else                          elem.setAttribute(k, v);
    });
  }
  children.flat(Infinity).forEach(c => {
    if (c === null || c === undefined) return;
    elem.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return elem;
}

function html(str) {
  const d = document.createElement("div");
  d.innerHTML = str;
  return d.firstElementChild;
}

/* ─── Users ────────────────────────────────────────────────── */
const USERS_LOGIN = [
  { id: 1, name: "Danah Almowinea",  email: "danah@yu.edu.sa",   password: "123456789", role: "student" },
  { id: 2, name: "Alaa Alhomayem",   email: "alaa@yu.edu.sa",    password: "123456789", role: "student" },
  { id: 3, name: "Shaimaa Seror",    email: "shaimaa@yu.edu.sa", password: "123456789", role: "student" },
  { id: 4, name: "Rafeef Ajeeb",     email: "rafeef@yu.edu.sa",  password: "123456789", role: "student" },
];

/* ─── App State ────────────────────────────────────────────── */
const state = {
  page:               "login",
  loggedIn:           false,
  currentUser:        null,
  selectedRestaurant: null,
  cart:               [],
  currentOrder:       null,
  orders:             JSON.parse(JSON.stringify(SEED_ORDERS)),
  menuItems:          MENUS[1].map(i => ({ ...i, available: true })),
  search:             "",
  payment:            "Online",
  vendorSection:      "Orders",
  adminTab:           "Users",
  toast:              null,
  toastTimer:         null,
  loginEmail:         "",
  loginPassword:      "",
  loginError:         "",
  loginSuccess:       "",
  showSignup:         false,
  signupName:         "",
  signupEmail:        "",
  signupPassword:     "",
  signupError:        "",
};

/* ─── State Mutation ───────────────────────────────────────── */
function navigate(page, extra = {}) {
  Object.assign(state, extra, { page });
  render();
}

function showToast(msg) {
  clearTimeout(state.toastTimer);
  state.toast = msg;
  render();
  state.toastTimer = setTimeout(() => { state.toast = null; render(); }, 2500);
}

function addToCart(item, restaurant) {
  if (state.cart.length > 0 && state.cart[0].restaurant !== restaurant.name) {
    if (!confirm(`Your cart has items from ${state.cart[0].restaurant}. Clear and add from ${restaurant.name}?`)) return;
    state.cart = [];
  }
  const existing = state.cart.find(i => i.id === item.id);
  if (existing) existing.qty += 1;
  else state.cart.push({ ...item, qty: 1, restaurant: restaurant.name });
  showToast(`${item.name} added to cart`);
}

function updateQty(id, delta) {
  state.cart = state.cart.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0);
  render();
}

function placeOrder(payment) {
  const orderId = "ORD-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  const total   = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const newOrder = {
    id:       orderId,
    student:  state.currentUser?.name || "Student",
    items:    state.cart.map(i => `${i.name} × ${i.qty}`).join(", "),
    total,
    status:   "Pending",
    time:     new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    payment,
    restaurant: state.cart[0]?.restaurant || "Campus",
  };

  // Save to localStorage
  const allOrders = JSON.parse(localStorage.getItem("ye_orders") || "[]");
  allOrders.unshift(newOrder);
  localStorage.setItem("ye_orders", JSON.stringify(allOrders));
  state.orders = allOrders;

  // Also save to DB with token
  const token = localStorage.getItem("ye_token") || "";
  fetch("api.php/save-order", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ total, payment, restaurant: newOrder.restaurant, items: newOrder.items })
  }).catch(() => {});

  state.currentOrder = {
    id:         orderId,
    restaurant: newOrder.restaurant,
    items:      [...state.cart],
    payment,
    status:     "Pending",
    etaSeconds: 600,
    startTime:  Date.now(),
  };
  state.cart = [];
  navigate("tracking");
  showToast("Order placed successfully!");
}

/* ─── Components ───────────────────────────────────────────── */

/* NAV */
function buildNav() {
  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);
  const tabs = [
    { label: "Home",      page: "home"     },
    { label: "My Orders", page: "tracking" },
    { label: "Vendor",    page: "vendor"   },
    { label: "Admin",     page: "admin"    },
  ];

  return el("nav", null,
    el("img", { src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgODAiIHdpZHRoPSIzMjAiIGhlaWdodD0iODAiPgogIDxwYXRoIGQ9Ik0xMCw4IEw0OCw4IFE1OCw4IDU4LDE4IEw1OCw2MiBRNTgsNzIgNDgsNzIgTDEwLDcyIFEwLDcyIDAsMTAgTDAsOCBRMCw4IDEwLDggWiIgZmlsbD0iIzFhMWExYSIvPgogIDx0ZXh0IHg9IjgiIHk9IjUyIiBmb250LWZhbWlseT0iQXJpYWwgQmxhY2ssIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtc2l6ZT0iMjgiIGZpbGw9IiNGRjY2MDAiPllFPC90ZXh0PgogIDx0ZXh0IHg9IjcwIiB5PSI0NiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNzAwIiBmb250LXNpemU9IjIyIiBmaWxsPSIjRkY2NjAwIj5ZYW1hbWFoPC90ZXh0PgogIDx0ZXh0IHg9IjcwIiB5PSI2OCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNDAwIiBmb250LXNpemU9IjIwIiBmaWxsPSIjMWExYTFhIj5FYXRzLjwvdGV4dD4KPC9zdmc+", className: "nav-logo-img", alt: "Yamamah Eats" }),
    el("div", { className: "nav-tabs" },
      ...tabs.map(t =>
        el("button", {
          className: "nav-tab" + (state.page === t.page ? " active" : ""),
          onClick: () => navigate(t.page),
        }, t.label)
      )
    ),
    el("div", { className: "nav-right" },
      state.currentUser ? el("span", { style: {
        color: "var(--mid)", fontSize: "13px", fontWeight: "500"
      }}, `👤 ${state.currentUser.name.split(" ")[0]}`) : null,
      el("button", { className: "cart-btn", onClick: () => navigate("cart") },
        "🛒 Cart",
        cartCount > 0 ? el("span", { className: "cart-badge" }, String(cartCount)) : null
      ),
      el("button", {
        style: {
          background: "none", border: "2px solid var(--sand)",
          padding: "7px 16px", borderRadius: "50px", cursor: "pointer",
          fontSize: "13px", fontWeight: "600", color: "var(--mid)",
          fontFamily: "'DM Sans', sans-serif", transition: "all .2s"
        },
        onClick: doLogout
      }, "Logout")
    )
  );
}

/* STATUS BADGE */
function buildBadge(status) {
  const map = {
    Pending:   "badge-pending",
    Preparing: "badge-preparing",
    Ready:     "badge-ready",
    Completed: "badge-completed",
    Rejected:  "badge-rejected",
  };
  return el("span", { className: `status-badge ${map[status] || ""}` }, status);
}

/* HOME PAGE */
function buildHomePage() {
  const filtered = RESTAURANTS.filter(r => {
    const q = state.search.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);
  });

  const heroSection = el("div", { className: "hero" },
    el("div", { className: "hero-content" },
      el("div", { className: "hero-tag" }, "🎓 Al Yamamah University"),
      el("h1", null, "Skip the queue,", el("br"), el("em", null, "enjoy your break")),
      el("p", null, "Order from your favourite campus restaurants in advance. Your food will be ready exactly when you need it."),
      el("div", { className: "hero-search" },
        (() => {
          const inp = el("input", { placeholder: "Search restaurants or dishes…", value: state.search });
          inp.addEventListener("input", e => { state.search = e.target.value; renderMain(); });
          return inp;
        })(),
        el("button", { onClick: () => {} }, "🔍 Search")
      ),
      el("div", { className: "hero-stats" },
        ...[["10+", "Restaurants"], ["~10min", "Avg pickup time"], ["0", "Queue time"]].map(([n, l]) =>
          el("div", { className: "hero-stat" },
            el("div", { className: "hero-stat-num" }, n),
            el("div", { className: "hero-stat-label" }, l)
          )
        )
      )
    )
  );

  const mainSection = el("div", { className: "main page" },
    el("div", { className: "section-header" },
      el("h2", { className: "section-title" }, "Campus Restaurants"),
      el("span", { className: "section-link" }, `${filtered.length} available`)
    ),
    filtered.length === 0
      ? el("div", { className: "empty-state" },
          el("div", { className: "empty-icon" }, "🔍"),
          el("h3", null, "No restaurants found"),
          el("p",  null, "Try searching for something else")
        )
      : el("div", { className: "restaurant-grid" },
          ...filtered.map(r =>
            el("div", { className: "restaurant-card", onClick: () => navigate("restaurant", { selectedRestaurant: r }) },
              el("div", { className: "restaurant-img" },
                el("span", { style: { fontSize: "64px" } }, r.emoji),
                el("span", { className: `restaurant-status ${r.open ? "status-open" : "status-closed"}` }, r.open ? "Open" : "Closed")
              ),
              el("div", { className: "restaurant-info" },
                el("div", { className: "restaurant-name" }, r.name),
                el("div", { className: "restaurant-meta" }, `⏱ ${r.time} · ⭐ ${r.rating} · 📍 ${r.location}`),
                r.desc ? el("div", { className: "restaurant-desc" }, r.desc) : null
              )
            )
          )
        )
  );

  return el("div", null, heroSection, mainSection);
}

/* RESTAURANT MENU PAGE */
function buildRestaurantPage() {
  const r     = state.selectedRestaurant;
  const items = MENUS[r.id] || [];

  return el("div", { className: "main page" },
    el("div", { className: "restaurant-page-header" },
      el("button", { className: "back-btn", onClick: () => navigate("home") }, "←"),
      el("div", { className: "restaurant-page-info" },
        el("h2", null, `${r.emoji} ${r.name}`),
        el("p",  null, `📍 ${r.location} · ⭐ ${r.rating} · ⏱ ${r.time}`)
      )
    ),
    el("div", { className: "menu-grid" },
      ...items.map(item =>
        el("div", { className: "menu-item" },
          el("div", { className: "item-emoji" }, item.emoji),
          el("div", { className: "item-details" },
            el("div", { className: "item-name" }, item.name),
            el("div", { className: "item-desc" }, item.desc),
            el("div", { className: "item-footer" },
              el("div", { className: "item-price" }, fmt(item.price)),
              el("button", { className: "add-btn", onClick: () => addToCart(item, r) }, "+ Add")
            )
          )
        )
      )
    )
  );
}

/* CART PAGE */
function buildCartPage() {
  if (state.cart.length === 0) {
    return el("div", { className: "main page" },
      el("div", { className: "empty-state" },
        el("div", { className: "empty-icon" }, "🛒"),
        el("h3", null, "Your cart is empty"),
        el("p",  null, "Add items from a restaurant to get started")
      )
    );
  }

  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const fee      = state.payment === "Online" ? 1.5 : 0;
  const total    = subtotal + fee;

  return el("div", { className: "main page" },
    el("div", { className: "section-header" },
      el("h2", { className: "section-title" }, "Your Cart 🛒")
    ),
    el("div", { className: "cart-layout" },

      /* Items */
      el("div", { className: "cart-items" },
        el("h3", { style: { fontFamily: "'Playfair Display',serif", fontSize: "20px", marginBottom: "20px" } },
          `Items from ${state.cart[0]?.restaurant}`
        ),
        ...state.cart.map(item =>
          el("div", { className: "cart-item" },
            el("div", { className: "cart-item-emoji" }, item.emoji),
            el("div", { className: "cart-item-info" },
              el("div", { className: "cart-item-name" }, item.name),
              el("div", { className: "cart-item-price" }, `${fmt(item.price)} each`)
            ),
            el("div", { className: "qty-controls" },
              el("button", { className: "qty-btn", onClick: () => updateQty(item.id, -1) }, "−"),
              el("span",  { className: "qty" }, String(item.qty)),
              el("button", { className: "qty-btn", onClick: () => updateQty(item.id,  1) }, "+")
            ),
            el("div", { className: "cart-item-total" }, fmt(item.price * item.qty))
          )
        )
      ),

      /* Summary */
      el("div", { className: "order-summary" },
        el("div", { className: "summary-title" }, "Order Summary"),
        el("div", { className: "summary-row" }, el("span", null, "Subtotal"), el("span", null, fmt(subtotal))),
        state.payment === "Online"
          ? el("div", { className: "summary-row" }, el("span", null, "Processing fee"), el("span", null, fmt(fee)))
          : null,
        el("div", { className: "summary-row total" }, el("span", null, "Total"), el("span", null, fmt(total))),

        el("div", { className: "payment-methods" },
          el("div", { className: "payment-label" }, "Payment Method"),
          el("div", { className: "payment-options" },
            ...["Online", "Cash on Pickup"].map(m =>
              el("div", {
                className: "payment-opt" + (state.payment === m ? " selected" : ""),
                onClick: () => { state.payment = m; render(); },
              }, m === "Online" ? "💳 Online" : "💵 Cash")
            )
          )
        ),
        el("button", { className: "place-order-btn", onClick: () => placeOrder(state.payment) }, "Place Order →"),
        el("p", { style: { fontSize: "12px", color: "var(--light-mid)", textAlign: "center", marginTop: "12px" } },
          "You'll be notified when your order is ready"
        )
      )
    )
  );
}

/* ORDER TRACKING PAGE */
let trackingInterval = null;

function buildTrackingPage() {
  if (!state.currentOrder) {
    return el("div", { className: "main page" },
      el("div", { className: "empty-state" },
        el("div", { className: "empty-icon" }, "📋"),
        el("h3", null, "No active orders"),
        el("p",  null, "Place an order to track it here")
      )
    );
  }

  // Sync status from localStorage
  const allOrders = JSON.parse(localStorage.getItem("ye_orders") || "[]");
  const latest = allOrders.find(o => o.id === state.currentOrder.id);
  if (latest) state.currentOrder.status = latest.status;

  const order  = state.currentOrder;
  const steps  = ["Pending", "Preparing", "Ready", "Completed", "Rejected"];
  const curIdx = steps.indexOf(order.status);
  const elapsed = Math.floor((Date.now() - order.startTime) / 1000);
  const eta     = Math.max(0, order.etaSeconds - elapsed);
  const mins    = Math.floor(eta / 60);
  const secs    = eta % 60;

  clearInterval(trackingInterval);
  trackingInterval = setInterval(() => {
    const section = document.getElementById("tracking-section");
    if (!section) { clearInterval(trackingInterval); return; }

    // Re-sync status every second
    const saved = JSON.parse(localStorage.getItem("ye_orders") || "[]");
    const fresh = saved.find(o => o.id === state.currentOrder.id);
    if (fresh && fresh.status !== state.currentOrder.status) {
      state.currentOrder.status = fresh.status;
      render();
      return;
    }

    const now    = Math.floor((Date.now() - order.startTime) / 1000);
    const remain = Math.max(0, order.etaSeconds - now);
    const tv     = section.querySelector(".timer-value");
    if (tv) tv.textContent = `${Math.floor(remain / 60)}:${String(remain % 60).padStart(2,"0")}`;
  }, 1000);

  // Show rejected state
  if (order.status === "Rejected") {
    clearInterval(trackingInterval);
    return el("div", { className: "main page", id: "tracking-section" },
      el("div", { style: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" } },
        el("button", { className: "back-btn", onClick: () => navigate("home") }, "←"),
        el("h2", { className: "section-title" }, "Order Tracking")
      ),
      el("div", { className: "tracking-card", style: { textAlign: "center" } },
        el("div", { style: { fontSize: "64px", marginBottom: "16px" } }, "❌"),
        el("div", { className: "tracking-order-id" }, `Order #${order.id}`),
        el("div", { className: "tracking-restaurant", style: { marginBottom: "12px" } }, order.restaurant),
        el("div", { style: {
          background: "var(--light-red)", color: "var(--red)",
          padding: "16px", borderRadius: "12px",
          fontWeight: "600", fontSize: "15px"
        }}, "Your order has been rejected by the restaurant"),
        el("button", {
          style: {
            marginTop: "20px", padding: "12px 32px", borderRadius: "50px",
            background: "var(--terracotta)", color: "white", border: "none",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px", fontWeight: "600"
          },
          onClick: () => navigate("home")
        }, "Order Again")
      )
    );
  }

  return el("div", { className: "main page", id: "tracking-section" },
    el("div", { style: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" } },
      el("button", { className: "back-btn", onClick: () => navigate("home") }, "←"),
      el("h2", { className: "section-title" }, "Order Tracking")
    ),
    el("div", { className: "tracking-card" },
      el("div", { className: "tracking-order-id" }, `Order #${order.id}`),
      el("div", { className: "tracking-restaurant" }, order.restaurant),
      el("div", { className: "tracking-steps" },
        ...["Pending", "Preparing", "Ready", "Completed"].map((step, i) => {
          const done   = i < curIdx;
          const active = i === curIdx;
          return el("div", { className: "tracking-step" },
            el("div", { className: `step-dot${done ? " done" : active ? " active" : ""}` }),
            el("div", { className: `step-label${done ? " done" : active ? " active" : " pending"}` }, step),
            el("div", { className: "step-time" },
              done ? "✓ Completed" : active ? "In progress…" : "Waiting"
            )
          );
        })
      ),
      order.status !== "Completed"
        ? el("div", { className: "tracking-timer" },
            el("div", { className: "timer-icon" }, "⏱"),
            el("div", { style: { flex: "1" } },
              el("div", { className: "timer-label" }, "Estimated wait time"),
              el("div", { className: "timer-value" }, `${mins}:${String(secs).padStart(2,"0")}`)
            )
          )
        : null
    )
  );
}

/* FETCH ORDERS FROM DB + localStorage */
function fetchVendorOrders() {
  const saved = JSON.parse(localStorage.getItem("ye_orders") || "[]");
  if (saved.length > 0) state.orders = saved;
}

function updateOrderStatus(orderId, newStatus) {
  // Update in state & localStorage immediately
  state.orders = state.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
  localStorage.setItem("ye_orders", JSON.stringify(state.orders));

  // Update current order tracking if same order
  if (state.currentOrder && state.currentOrder.id === orderId) {
    state.currentOrder.status = newStatus;
  }

  // Save to DB
  const order = state.orders.find(o => o.id === orderId);
  const dbId  = order?.dbId || orderId.replace("ORD-", "");
  fetch("api.php/update-order", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ order_id: dbId, status: newStatus })
  }).catch(() => {});

  render();
  showToast(`Order ${newStatus}!`);
}

/* VENDOR PAGE */
function buildVendorPage() {
  // Load from localStorage only - no API call that blocks
  const saved = JSON.parse(localStorage.getItem("ye_orders") || "[]");
  if (saved.length > 0) state.orders = saved;

  const totalRevenue = state.orders.filter(o => o.status === "Completed").reduce((s, o) => s + o.total, 0);
  const pendingCount = state.orders.filter(o => o.status === "Pending").length;

  const sidebar = el("div", { className: "vendor-sidebar" },
    ...["Orders", "Menu Items", "Reports"].map(s =>
      el("div", {
        className: `vendor-nav-item${state.vendorSection === s ? " active" : ""}`,
        onClick: () => { state.vendorSection = s; render(); },
      }, (s === "Orders" ? "📋 " : s === "Menu Items" ? "🍽 " : "📊 ") + s)
    )
  );

  let content;

  if (state.vendorSection === "Orders") {
    content = el("div", null,
      el("div", { className: "stats-row" },
        ...[
          ["Pending",         String(pendingCount),     "Awaiting action"],
          ["Today's Revenue", `SAR ${totalRevenue}`,    "↑ +12% vs yesterday"],
          ["Total Orders",    String(state.orders.length), "Today"],
        ].map(([label, val, sub]) =>
          el("div", { className: "stat-card" },
            el("div", { className: "stat-card-label" }, label),
            el("div", { className: "stat-card-value" }, val),
            el("div", { className: "stat-card-sub"   }, sub)
          )
        )
      ),
      el("div", { className: "orders-list" },
        el("h3", { style: { fontFamily: "'Playfair Display',serif", fontSize: "20px", marginBottom: "20px" } }, "Live Orders"),
        ...state.orders.map(ord => {
          const actions = [];
          if (ord.status === "Pending") {
            actions.push(
              el("button", { className: "accept-btn", onClick: () => updateOrderStatus(ord.id, "Preparing") }, "Accept"),
              el("button", { className: "reject-btn", onClick: () => updateOrderStatus(ord.id, "Rejected")  }, "Reject")
            );
          } else if (ord.status === "Preparing") {
            actions.push(el("button", { className: "accept-btn", onClick: () => updateOrderStatus(ord.id, "Ready")     }, "Mark Ready"));
          } else if (ord.status === "Ready") {
            actions.push(el("button", { className: "accept-btn", onClick: () => updateOrderStatus(ord.id, "Completed") }, "Complete"));
          }
          return el("div", { className: "order-row" },
            el("div", { className: "order-id"         }, ord.id),
            el("div", { className: "order-student"    }, ord.student),
            el("div", { className: "order-items-text" }, ord.items),
            el("div", { className: "order-total"      }, `SAR ${ord.total}`),
            buildBadge(ord.status),
            actions.length ? el("div", { className: "order-actions" }, ...actions) : null
          );
        })
      )
    );
  } else if (state.vendorSection === "Menu Items") {
    content = el("div", null,
      el("h3", { style: { fontFamily: "'Playfair Display',serif", fontSize: "20px", marginBottom: "20px" } }, "Menu Management"),
      el("div", { className: "menu-manage-grid" },
        ...state.menuItems.map(item =>
          el("div", { className: "menu-manage-card" },
            el("div", { className: "menu-manage-header" },
              el("div", { className: "menu-manage-emoji" }, item.emoji),
              el("div", null,
                el("div", { className: "menu-manage-name"  }, item.name),
                el("div", { className: "menu-manage-price" }, fmt(item.price))
              )
            ),
            el("div", { className: "avail-toggle" },
              el("span", { className: "avail-label" }, item.available ? "Available" : "Unavailable"),
              el("button", {
                className: `toggle ${item.available ? "on" : "off"}`,
                onClick: () => {
                  item.available = !item.available;
                  render();
                },
              })
            )
          )
        )
      )
    );
  } else {
    const completed = state.orders.filter(o => o.status === "Completed").length;
    const avg       = completed > 0 ? (totalRevenue / completed).toFixed(2) : "0.00";
    content = el("div", { className: "cart-items" },
      el("h3", { style: { fontFamily: "'Playfair Display',serif", fontSize: "22px", marginBottom: "24px" } }, "Daily Sales Report"),
      ...[
        ["Total Orders",       state.orders.length],
        ["Completed",          completed],
        ["Rejected",           state.orders.filter(o => o.status === "Rejected").length],
        ["Total Revenue",      `SAR ${totalRevenue}`],
        ["Average Order Value",`SAR ${avg}`],
      ].map(([label, value]) =>
        el("div", { className: "summary-row", style: { fontSize: "16px", marginBottom: "16px" } },
          el("span", null, label),
          el("strong", { style: { color: "var(--charcoal)" } }, String(value))
        )
      )
    );
  }

  return el("div", { className: "main page" },
    el("div", { className: "section-header" },
      el("h2", { className: "section-title" }, "Vendor Dashboard 🏪"),
      el("span", { style: { color: "var(--light-mid)", fontSize: "14px" } }, "Barn's")
    ),
    el("div", { className: "vendor-grid" }, sidebar, el("div", null, content))
  );
}

/* ADMIN PAGE */
function buildAdminPage() {
  const users = SEED_USERS;
  const roleClass = { student: "role-student", vendor: "role-vendor", admin: "role-admin" };

  let tabContent;

  if (state.adminTab === "Users") {
    tabContent = el("div", { className: "users-table" },
      el("div", { className: "table-header" },
        el("span", null, "Name"), el("span", null, "Email"),
        el("span", null, "Role"), el("span", null, "Status"), el("span", null, "Actions")
      ),
      ...users.map(u =>
        el("div", { className: "table-row" },
          el("span", null, u.name),
          el("span", { style: { color: "var(--mid)", fontSize: "13px" } }, u.email),
          el("span", null, el("span", { className: `role-badge ${roleClass[u.role]}` }, u.role)),
          el("span", { style: { color: u.status === "active" ? "var(--green)" : "var(--red)", fontWeight: "600", fontSize: "13px" } },
            u.status === "active" ? "✓ Active" : "✗ Banned"
          ),
          el("span", null,
            el("button", { style: { background: "none", border: "1px solid var(--sand)", padding: "4px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", color: "var(--mid)" } },
              u.status === "active" ? "Ban" : "Restore"
            )
          )
        )
      )
    );
  } else if (state.adminTab === "Restaurants") {
    tabContent = el("div", { className: "restaurant-grid" },
      ...RESTAURANTS.map(r =>
        el("div", { className: "restaurant-card", style: { cursor: "default" } },
          el("div", { className: "restaurant-img" },
            el("span", { style: { fontSize: "64px" } }, r.emoji),
            el("span", { className: `restaurant-status ${r.open ? "status-open" : "status-closed"}` }, r.open ? "Open" : "Closed")
          ),
          el("div", { className: "restaurant-info" },
            el("div", { className: "restaurant-name" }, r.name),
            el("div", { className: "restaurant-meta" }, `⭐ ${r.rating} · 📍 ${r.location}`),
            el("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: "8px" } },
              el("button", { style: { background: "var(--light-red)", color: "var(--red)", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" } }, "Deactivate")
            )
          )
        )
      )
    );
  }

  return el("div", { className: "main page" },
    el("div", { className: "section-header" },
      el("h2", { className: "section-title" }, "Admin Dashboard 🛡"),
      el("span", { style: { color: "var(--light-mid)", fontSize: "14px" } }, "System Overview")
    ),
    el("div", { className: "stats-row", style: { gridTemplateColumns: "repeat(4,1fr)", marginBottom: "28px" } },
      ...[
        ["Total Users",   users.length,                                    "Registered accounts"],
        ["Restaurants",   RESTAURANTS.length,                              "On-campus vendors"],
        ["Open Now",      RESTAURANTS.filter(r => r.open).length,          "Currently serving"],
        ["Banned Users",  users.filter(u => u.status === "banned").length, "Suspended accounts"],
      ].map(([label, val, sub]) =>
        el("div", { className: "stat-card" },
          el("div", { className: "stat-card-label" }, label),
          el("div", { className: "stat-card-value" }, String(val)),
          el("div", { className: "stat-card-sub"   }, sub)
        )
      )
    ),
    el("div", { className: "admin-tabs" },
      ...["Users", "Restaurants"].map(t =>
        el("button", {
          className: `admin-tab${state.adminTab === t ? " active" : ""}`,
          onClick: () => { state.adminTab = t; render(); },
        }, t)
      )
    ),
    tabContent
  );
}

/* TOAST */
function buildToast() {
  return state.toast ? el("div", { className: "toast" }, "✅ " + state.toast) : null;
}

/* ─── Login Page ───────────────────────────────────────────── */
function buildLoginPage() {
  return el("div", { style: {
    minHeight: "100vh", background: "var(--charcoal)",
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", overflow: "hidden"
  }},
    el("div", { style: {
      position: "absolute", inset: "0",
      background: "radial-gradient(ellipse at 60% 40%, rgba(201,96,58,.3) 0%, transparent 70%)"
    }}),

    el("div", { style: {
      background: "white", borderRadius: "24px", padding: "48px 40px",
      width: "100%", maxWidth: "420px", boxShadow: "var(--shadow-lg)",
      position: "relative", zIndex: "1"
    }},
      // Logo
      el("div", { style: { textAlign: "center", marginBottom: "28px" }},
        el("div", { style: {
          fontFamily: "'Playfair Display', serif", fontSize: "28px",
          fontWeight: "900", color: "var(--charcoal)"
        }}, "YAMAMAH", el("span", { style: { color: "var(--terracotta)" }}, "EATS")),
        el("p", { style: { color: "var(--light-mid)", fontSize: "14px", marginTop: "6px" }},
          "Al Yamamah University · Campus Food")
      ),

      // Toggle tabs
      el("div", { style: {
        display: "flex", background: "var(--cream)", borderRadius: "50px",
        padding: "4px", marginBottom: "24px"
      }},
        el("button", {
          style: {
            flex: "1", padding: "10px", borderRadius: "50px", border: "none",
            background: !state.showSignup ? "var(--terracotta)" : "transparent",
            color: !state.showSignup ? "white" : "var(--mid)",
            fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: "600",
            cursor: "pointer", transition: "all .2s"
          },
          onClick: () => { state.showSignup = false; state.loginError = ""; state.signupError = ""; state.loginSuccess = ""; render(); }
        }, "Login"),
        el("button", {
          style: {
            flex: "1", padding: "10px", borderRadius: "50px", border: "none",
            background: state.showSignup ? "var(--terracotta)" : "transparent",
            color: state.showSignup ? "white" : "var(--mid)",
            fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: "600",
            cursor: "pointer", transition: "all .2s"
          },
          onClick: () => { state.showSignup = true; state.loginError = ""; state.signupError = ""; state.loginSuccess = ""; render(); }
        }, "Sign Up")
      ),

      // Success message
      state.loginSuccess ? el("div", { style: {
        background: "var(--light-green)", color: "var(--green)",
        padding: "12px 16px", borderRadius: "10px",
        fontSize: "13px", marginBottom: "16px", textAlign: "center"
      }}, state.loginSuccess) : null,

      // Error message
      (state.loginError || state.signupError) ? el("div", { style: {
        background: "var(--light-red)", color: "var(--red)",
        padding: "12px 16px", borderRadius: "10px",
        fontSize: "13px", marginBottom: "16px", textAlign: "center"
      }}, state.loginError || state.signupError) : null,

      // ── LOGIN FORM ──
      !state.showSignup ? el("div", null,
        el("div", { className: "form-group" },
          el("label", { className: "form-label" }, "Email"),
          (() => {
            const inp = el("input", {
              className: "form-input", type: "email",
              placeholder: "yourname@yu.edu.sa",
              value: state.loginEmail
            });
            inp.addEventListener("input", e => { state.loginEmail = e.target.value; });
            return inp;
          })()
        ),
        el("div", { className: "form-group" },
          el("label", { className: "form-label" }, "Password"),
          (() => {
            const inp = el("input", {
              className: "form-input", type: "password",
              placeholder: "••••••••••",
              value: state.loginPassword
            });
            inp.addEventListener("input", e => { state.loginPassword = e.target.value; });
            inp.addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
            return inp;
          })()
        ),
        el("button", {
          style: {
            width: "100%", padding: "14px", borderRadius: "50px", border: "none",
            background: "var(--terracotta)", color: "white",
            fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: "700",
            cursor: "pointer", marginTop: "8px", transition: "all .2s"
          },
          onClick: doLogin
        }, "Login →")
      ) : null,

      // ── SIGNUP FORM ──
      state.showSignup ? el("div", null,
        el("div", { className: "form-group" },
          el("label", { className: "form-label" }, "Full Name"),
          (() => {
            const inp = el("input", {
              className: "form-input", type: "text",
              placeholder: "Your full name",
              value: state.signupName
            });
            inp.addEventListener("input", e => { state.signupName = e.target.value; });
            return inp;
          })()
        ),
        el("div", { className: "form-group" },
          el("label", { className: "form-label" }, "University Email"),
          (() => {
            const inp = el("input", {
              className: "form-input", type: "email",
              placeholder: "yourname@yu.edu.sa",
              value: state.signupEmail
            });
            inp.addEventListener("input", e => { state.signupEmail = e.target.value; });
            return inp;
          })()
        ),
        el("div", { className: "form-group" },
          el("label", { className: "form-label" }, "Password"),
          (() => {
            const inp = el("input", {
              className: "form-input", type: "password",
              placeholder: "Min. 8 characters",
              value: state.signupPassword
            });
            inp.addEventListener("input", e => { state.signupPassword = e.target.value; });
            inp.addEventListener("keydown", e => { if (e.key === "Enter") doSignup(); });
            return inp;
          })()
        ),
        el("button", {
          style: {
            width: "100%", padding: "14px", borderRadius: "50px", border: "none",
            background: "var(--terracotta)", color: "white",
            fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: "700",
            cursor: "pointer", marginTop: "8px", transition: "all .2s"
          },
          onClick: doSignup
        }, "Create Account →"),
        el("p", { style: { fontSize: "11px", color: "var(--light-mid)", textAlign: "center", marginTop: "12px" }},
          "Your account will be created as a student")
      ) : null
    )
  );
}

function doLogin() {
  const email    = state.loginEmail.trim();
  const password = state.loginPassword;

  if (!email || !password) {
    state.loginError = "Please enter your email and password.";
    render();
    return;
  }

  fetch("api.php/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(r => r.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("ye_token", data.token);
      localStorage.setItem("ye_user",  JSON.stringify(data.user));
      state.loggedIn    = true;
      state.currentUser = data.user;
      state.loginError  = "";
      state.page = data.user.role === "vendor" ? "vendor" : data.user.role === "admin" ? "admin" : "home";
      render();
      showToast(`Welcome, ${data.user.name.split(" ")[0]}! 👋`);
    } else {
      const user = USERS_LOGIN.find(u => u.email === email && u.password === password);
      if (user) {
        state.loggedIn    = true;
        state.currentUser = user;
        state.loginError  = "";
        state.page = user.role === "vendor" ? "vendor" : user.role === "admin" ? "admin" : "home";
        render();
        showToast(`Welcome, ${user.name.split(" ")[0]}! 👋`);
      } else {
        state.loginError = data.error || "Invalid email or password.";
        render();
      }
    }
  })
  .catch(() => {
    const user = USERS_LOGIN.find(u => u.email === email && u.password === password);
    if (user) {
      state.loggedIn    = true;
      state.currentUser = user;
      state.loginError  = "";
      state.page = user.role === "vendor" ? "vendor" : user.role === "admin" ? "admin" : "home";
      render();
      showToast(`Welcome, ${user.name.split(" ")[0]}! 👋`);
    } else {
      state.loginError = "Invalid email or password. Please try again.";
      render();
    }
  });
}

function doSignup() {
  const name     = state.signupName.trim();
  const email    = state.signupEmail.trim();
  const password = state.signupPassword;

  if (!name || !email || !password) {
    state.signupError = "Please fill in all fields.";
    render();
    return;
  }
  if (password.length < 8) {
    state.signupError = "Password must be at least 8 characters.";
    render();
    return;
  }

  fetch("api.php/auth/register", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ name, email, password, role: "student" })
  })
  .then(r => r.json())
  .then(data => {
    if (data.token || data.user_id) {
      state.signupError    = "";
      state.signupName     = "";
      state.signupEmail    = "";
      state.signupPassword = "";
      state.showSignup     = false;
      state.loginSuccess   = "✅ Account created! You can now login.";
      render();
    } else {
      state.signupError = data.error || "Registration failed. Please try again.";
      render();
    }
  })
  .catch(() => {
    state.signupError = "Could not connect to server.";
    render();
  });
}

function doLogout() {
  localStorage.removeItem("ye_token");
  localStorage.removeItem("ye_user");
  state.loggedIn      = false;
  state.currentUser   = null;
  state.page          = "login";
  state.cart          = [];
  state.loginEmail    = "";
  state.loginPassword = "";
  state.loginSuccess  = "";
  state.signupError   = "";
  render();
}

/* ─── Main Render ──────────────────────────────────────────── */
let appRoot = null;

function renderMain() {
  const main = appRoot.querySelector("#main-content");
  if (!main) return;

  let page;
  if      (state.page === "home")       page = buildHomePage();
  else if (state.page === "restaurant") page = buildRestaurantPage();
  else if (state.page === "cart")       page = buildCartPage();
  else if (state.page === "tracking")   page = buildTrackingPage();
  else if (state.page === "vendor")     page = buildVendorPage();
  else if (state.page === "admin")      page = buildAdminPage();

  main.innerHTML = "";
  if (page) main.appendChild(page);

  const toastContainer = appRoot.querySelector("#toast-container");
  if (toastContainer) {
    toastContainer.innerHTML = "";
    const t = buildToast();
    if (t) toastContainer.appendChild(t);
  }
}

function render() {
  if (!appRoot) {
    appRoot = document.getElementById("app");
    appRoot.innerHTML = "";
    appRoot.className = "app";

    const navWrapper  = el("div", { id: "nav-wrapper" });
    const mainWrapper = el("div", { id: "main-content" });
    const toastWrapper = el("div", { id: "toast-container" });

    appRoot.appendChild(navWrapper);
    appRoot.appendChild(mainWrapper);
    appRoot.appendChild(toastWrapper);
  }

  // If not logged in, show login page only
  if (!state.loggedIn) {
    const navWrapper = appRoot.querySelector("#nav-wrapper");
    navWrapper.innerHTML = "";
    const mainWrapper = appRoot.querySelector("#main-content");
    mainWrapper.innerHTML = "";
    mainWrapper.appendChild(buildLoginPage());
    const toastWrapper = appRoot.querySelector("#toast-container");
    toastWrapper.innerHTML = "";
    const t = buildToast();
    if (t) toastWrapper.appendChild(t);
    return;
  }

  /* Always refresh nav (cart count changes) */
  const navWrapper = appRoot.querySelector("#nav-wrapper");
  navWrapper.innerHTML = "";
  navWrapper.appendChild(buildNav());

  renderMain();
}

/* ─── Boot ─────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const savedUser  = localStorage.getItem("ye_user");
  const savedToken = localStorage.getItem("ye_token");
  if (savedUser && savedToken) {
    try {
      const user = JSON.parse(savedUser);
      state.currentUser = user;
      state.loggedIn    = true;
      state.page        = "home";
    } catch(e) {}
  }
  // Load shared orders
  const savedOrders = JSON.parse(localStorage.getItem("ye_orders") || "[]");
  if (savedOrders.length > 0) state.orders = savedOrders;
  render();
});
