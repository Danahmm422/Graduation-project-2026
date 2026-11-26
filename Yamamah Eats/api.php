<?php
/* ═══════════════════════════════════════════════════════════════
   Yamamah Eats — api.php
   RESTful JSON API — Al Yamamah University Campus Food System
   ───────────────────────────────────────────────────────────────
   Base URL:  https://your-domain.com/api.php
   Auth:      Bearer token (JWT) in Authorization header
   Format:    application/json

   ENDPOINTS
   ─────────────────────────────────────────────
   POST   /auth/register          Register new student
   POST   /auth/login             Login → returns token
   POST   /auth/logout            Invalidate token

   GET    /restaurants            List all restaurants
   GET    /restaurants/{id}       Single restaurant + menu

   GET    /menu/{restaurant_id}   Menu items for a restaurant
   GET    /menu/item/{id}         Single menu item

   POST   /orders                 Place a new order
   GET    /orders                 Student's order history
   GET    /orders/{id}            Single order + status
   PATCH  /orders/{id}/status     Vendor: update order status
   DELETE /orders/{id}            Cancel pending order

   GET    /vendor/orders          Vendor: incoming orders
   GET    /vendor/menu            Vendor: manage menu
   POST   /vendor/menu            Vendor: add menu item
   PUT    /vendor/menu/{id}       Vendor: update menu item
   PATCH  /vendor/menu/{id}/avail Vendor: toggle availability
   GET    /vendor/reports/daily   Vendor: daily sales report

   GET    /admin/users            Admin: list all users
   PATCH  /admin/users/{id}/ban   Admin: ban/unban user
   GET    /admin/restaurants      Admin: all restaurants
   PATCH  /admin/restaurants/{id} Admin: activate/deactivate
   ═══════════════════════════════════════════════════════════════ */

declare(strict_types=1);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

/* ─── Database Configuration ───────────────────────────────── */
define("DB_HOST", "localhost");
define("DB_NAME", "yamamah_eats");
define("DB_USER", "root");
define("DB_PASS", "");
define("DB_PORT", "3306");

/* ─── JWT Secret (change in production!) ───────────────────── */
define("JWT_SECRET", "yamamah_eats_secret_2025_change_me");
define("JWT_EXPIRY",  3600); // 1 hour

/* ─── Database Connection ──────────────────────────────────── */
function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            respond(500, ["error" => "Database connection failed: " . $e->getMessage()]);
        }
    }
    return $pdo;
}

/* ─── JWT Helpers ───────────────────────────────────────────── */
function jwtEncode(array $payload): string {
    $header  = base64url(json_encode(["alg" => "HS256", "typ" => "JWT"]));
    $payload["iat"] = time();
    $payload["exp"] = time() + JWT_EXPIRY;
    $body    = base64url(json_encode($payload));
    $sig     = base64url(hash_hmac("sha256", "$header.$body", JWT_SECRET, true));
    return "$header.$body.$sig";
}

function jwtDecode(string $token): ?array {
    $parts = explode(".", $token);
    if (count($parts) !== 3) return null;
    [$header, $body, $sig] = $parts;
    $expected = base64url(hash_hmac("sha256", "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(base64_decode(strtr($body, "-_", "+/")), true);
    if (!$payload || $payload["exp"] < time()) return null;
    return $payload;
}

function base64url(string $data): string {
    return rtrim(strtr(base64_encode($data), "+/", "-_"), "=");
}

/* ─── Auth Middleware ───────────────────────────────────────── */
function requireAuth(string ...$roles): array {
    $header = $_SERVER["HTTP_AUTHORIZATION"] ?? "";
    if (!preg_match("/^Bearer\s+(.+)$/i", $header, $m)) {
        respond(401, ["error" => "Authorization token missing"]);
    }
    $payload = jwtDecode($m[1]);
    if (!$payload) {
        respond(401, ["error" => "Invalid or expired token"]);
    }
    if (!empty($roles) && !in_array($payload["role"], $roles, true)) {
        respond(403, ["error" => "Insufficient permissions"]);
    }
    return $payload;
}

/* ─── Response Helper ───────────────────────────────────────── */
function respond(int $code, array $data): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* ─── Request Helpers ───────────────────────────────────────── */
function body(): array {
    $raw = file_get_contents("php://input");
    return json_decode($raw ?: "{}", true) ?? [];
}

function method(): string {
    return strtoupper($_SERVER["REQUEST_METHOD"]);
}

/* ─── Router ────────────────────────────────────────────────── */
$uri    = trim(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH), "/");
$parts  = explode("/", $uri);
// Strip a leading directory segment if running in a sub-folder
// e.g. /api.php  →  ["api.php"]  or  /yamamah/api.php/restaurants → shift
// Remove "api.php" prefix if present
if ($parts[0] === "api.php") array_shift($parts);

$resource  = $parts[0] ?? "";
$sub       = $parts[1] ?? "";
$id        = $parts[2] ?? "";
$action    = $parts[3] ?? "";

/* ─── SETUP ROUTE (run once to hash passwords) ──────────────── */
if ($resource === "setup") {
    $hash = password_hash("123456789", PASSWORD_BCRYPT);
    $stmt = db()->prepare("UPDATE users SET password = ?");
    $stmt->execute([$hash]);
    respond(200, ["message" => "Passwords hashed successfully", "hash" => $hash]);
}

/* ═══════════════════════════════════════════════════════════════
   AUTH ROUTES
═══════════════════════════════════════════════════════════════ */
if ($resource === "auth") {

    /* POST /auth/register */
    if ($sub === "register" && method() === "POST") {
        $b = body();
        $name     = trim($b["name"]     ?? "");
        $email    = trim($b["email"]    ?? "");
        $password = trim($b["password"] ?? "");
        $role     = $b["role"] ?? "student";

        if (!$name || !$email || !$password) {
            respond(400, ["error" => "name, email and password are required"]);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(400, ["error" => "Invalid email address"]);
        }
        if (!in_array($role, ["student", "vendor"], true)) {
            respond(400, ["error" => "Role must be student or vendor"]);
        }

        $stmt = db()->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            respond(409, ["error" => "Email already registered"]);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = db()->prepare("INSERT INTO users (name, email, password, role, status, created_at) VALUES (?,?,?,?,'active', NOW())");
        $stmt->execute([$name, $email, $hash, $role]);
        $userId = (int)db()->lastInsertId();

        respond(201, [
            "message" => "Account created successfully",
            "user_id" => $userId,
            "token"   => jwtEncode(["user_id" => $userId, "email" => $email, "role" => $role])
        ]);
    }

    /* POST /auth/login */
    if ($sub === "login" && method() === "POST") {
        $b = body();
        $email    = trim($b["email"]    ?? "");
        $password = trim($b["password"] ?? "");

        if (!$email || !$password) {
            respond(400, ["error" => "email and password are required"]);
        }

        $stmt = db()->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user["password"])) {
            // Fallback: check plain text for demo
            if (!$user || $user["password"] !== $password) {
                respond(401, ["error" => "Invalid credentials"]);
            }
        }
        if ($user["status"] === "banned") {
            respond(403, ["error" => "Your account has been suspended"]);
        }

        respond(200, [
            "message" => "Login successful",
            "token"   => jwtEncode(["user_id" => $user["id"], "email" => $user["email"], "role" => $user["role"]]),
            "user"    => [
                "id"    => $user["id"],
                "name"  => $user["name"],
                "email" => $user["email"],
                "role"  => $user["role"],
            ]
        ]);
    }

    /* POST /auth/logout */
    if ($sub === "logout" && method() === "POST") {
        // Stateless JWT — client just discards the token
        respond(200, ["message" => "Logged out successfully"]);
    }

    respond(404, ["error" => "Auth route not found"]);
}

/* ═══════════════════════════════════════════════════════════════
   SAVE ORDER (saves real order to DB)
═══════════════════════════════════════════════════════════════ */
if ($resource === "save-order") {
    $b          = body();
    $token      = $_SERVER["HTTP_AUTHORIZATION"] ?? "";
    $studentId  = 1; // default

    // Get student ID from token
    if (preg_match("/^Bearer\s+(.+)$/i", $token, $m)) {
        $payload = jwtDecode($m[1]);
        if ($payload) $studentId = (int)$payload["user_id"];
    }

    $total      = (float)($b["total"]      ?? 0);
    $payment    = $b["payment"]            ?? "Cash";
    $restaurant = $b["restaurant"]         ?? "Campus";
    $items      = $b["items"]              ?? "";

    // Find vendor by restaurant name
    $stmt = db()->prepare("SELECT vendor_id FROM vendors WHERE restaurant_name = ? LIMIT 1");
    $stmt->execute([$restaurant]);
    $vendor = $stmt->fetch();
    $vendorId = $vendor ? (int)$vendor["vendor_id"] : 1;

    // Save order
    $stmt = db()->prepare("
        INSERT INTO orders (student_id, vendor_id, total_price, status, payment_method, created_at)
        VALUES (?, ?, ?, 'Pending', ?, NOW())
    ");
    $stmt->execute([$studentId, $vendorId, $total, $payment]);
    $orderId = (int)db()->lastInsertId();

    // Save notification for student
    $stmt2 = db()->prepare("INSERT INTO notifications (user_id, message, is_read, created_at) VALUES (?, ?, 0, NOW())");
    $stmt2->execute([$studentId, "Your order #$orderId from $restaurant has been placed successfully."]);

    respond(201, ["message" => "Order saved", "order_id" => $orderId]);
}

/* ═══════════════════════════════════════════════════════════════
   GET ALL ORDERS (for vendor dashboard)
═══════════════════════════════════════════════════════════════ */
if ($resource === "get-orders") {
    $stmt = db()->query("
        SELECT
            o.order_id,
            o.total_price,
            o.status,
            o.payment_method,
            o.created_at,
            u.name  AS student_name,
            v.restaurant_name
        FROM orders o
        JOIN users   u ON u.id         = o.student_id
        JOIN vendors v ON v.vendor_id  = o.vendor_id
        ORDER BY o.created_at DESC
        LIMIT 50
    ");
    respond(200, ["data" => $stmt->fetchAll()]);
}

/* ═══════════════════════════════════════════════════════════════
   UPDATE ORDER STATUS
═══════════════════════════════════════════════════════════════ */
if ($resource === "update-order") {
    $b      = body();
    $id     = (int)($b["order_id"] ?? 0);
    $status = $b["status"]         ?? "";

    $allowed = ["Pending", "Preparing", "Ready", "Completed", "Rejected"];
    if (!in_array($status, $allowed)) {
        respond(400, ["error" => "Invalid status"]);
    }

    $stmt = db()->prepare("UPDATE orders SET status = ? WHERE order_id = ?");
    $stmt->execute([$status, $id]);

    // Notify student
    $stmt2 = db()->prepare("SELECT student_id FROM orders WHERE order_id = ?");
    $stmt2->execute([$id]);
    $order = $stmt2->fetch();
    if ($order) {
        $stmt3 = db()->prepare("INSERT INTO notifications (user_id, message, is_read, created_at) VALUES (?, ?, 0, NOW())");
        $stmt3->execute([$order["student_id"], "Your order #$id status has been updated to: $status"]);
    }

    respond(200, ["message" => "Status updated to $status"]);
}


/* ═══════════════════════════════════════════════════════════════
   RESTAURANT ROUTES
═══════════════════════════════════════════════════════════════ */
if ($resource === "restaurants") {

    /* GET /restaurants */
    if (!$sub && method() === "GET") {
        $rows = db()->query("SELECT r.*, v.user_id AS vendor_user_id FROM vendors r LEFT JOIN users v ON v.id = r.user_id WHERE r.is_open = 1 ORDER BY r.restaurant_name")->fetchAll();
        respond(200, ["data" => $rows]);
    }

    /* GET /restaurants/{id} */
    if ($sub && method() === "GET") {
        $stmt = db()->prepare("SELECT * FROM vendors WHERE vendor_id = ?");
        $stmt->execute([(int)$sub]);
        $vendor = $stmt->fetch();
        if (!$vendor) respond(404, ["error" => "Restaurant not found"]);

        $stmt2 = db()->prepare("SELECT * FROM menuitems WHERE vendor_id = ? AND availability = 1 ORDER BY name");
        $stmt2->execute([(int)$sub]);
        $items = $stmt2->fetchAll();

        respond(200, ["data" => array_merge($vendor, ["menu" => $items])]);
    }

    respond(404, ["error" => "Restaurant route not found"]);
}

/* ═══════════════════════════════════════════════════════════════
   MENU ROUTES
═══════════════════════════════════════════════════════════════ */
if ($resource === "menu") {

    /* GET /menu/{restaurant_id} */
    if ($sub && $id !== "item" && method() === "GET") {
        $stmt = db()->prepare("SELECT * FROM menuitems WHERE vendor_id = ? AND availability = 1 ORDER BY name");
        $stmt->execute([(int)$sub]);
        respond(200, ["data" => $stmt->fetchAll()]);
    }

    /* GET /menu/item/{id} */
    if ($sub === "item" && $id && method() === "GET") {
        $stmt = db()->prepare("SELECT * FROM menuitems WHERE item_id = ?");
        $stmt->execute([(int)$id]);
        $item = $stmt->fetch();
        if (!$item) respond(404, ["error" => "Menu item not found"]);
        respond(200, ["data" => $item]);
    }

    respond(404, ["error" => "Menu route not found"]);
}

/* ═══════════════════════════════════════════════════════════════
   ORDER ROUTES
═══════════════════════════════════════════════════════════════ */
if ($resource === "orders") {
    $user = requireAuth();

    /* POST /orders  — place order */
    if (!$sub && method() === "POST") {
        $b         = body();
        $vendorId  = (int)($b["vendor_id"]      ?? 0);
        $payMethod = $b["payment_method"]        ?? "Cash";
        $cartItems = $b["items"]                 ?? [];

        if (!$vendorId || empty($cartItems)) {
            respond(400, ["error" => "vendor_id and items are required"]);
        }
        if (!in_array($payMethod, ["Online","Cash"], true)) {
            respond(400, ["error" => "payment_method must be Online or Cash"]);
        }

        // Check ban: 3 uncollected orders = ban
        $stmt = db()->prepare("SELECT COUNT(*) FROM orders WHERE student_id = ? AND status = 'Rejected' AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $stmt->execute([$user["user_id"]]);
        if ((int)$stmt->fetchColumn() >= 3) {
            respond(403, ["error" => "Account suspended: too many uncollected orders"]);
        }

        // Calculate total
        $total = 0;
        foreach ($cartItems as $ci) {
            $stmt = db()->prepare("SELECT price FROM menuitems WHERE item_id = ? AND vendor_id = ? AND availability = 1");
            $stmt->execute([(int)$ci["item_id"], $vendorId]);
            $row = $stmt->fetch();
            if (!$row) respond(400, ["error" => "Item {$ci["item_id"]} not available"]);
            $total += $row["price"] * (int)($ci["quantity"] ?? 1);
        }

        db()->beginTransaction();
        try {
            $stmt = db()->prepare("INSERT INTO orders (student_id, vendor_id, total_price, status, payment_method, created_at) VALUES (?,?,?,'Pending',?,NOW())");
            $stmt->execute([$user["user_id"], $vendorId, $total, $payMethod]);
            $orderId = (int)db()->lastInsertId();

            foreach ($cartItems as $ci) {
                $stmt = db()->prepare("SELECT price FROM menuitems WHERE item_id = ?");
                $stmt->execute([(int)$ci["item_id"]]);
                $price = (float)$stmt->fetchColumn();
                $qty   = (int)($ci["quantity"] ?? 1);

                $stmt2 = db()->prepare("INSERT INTO orderitems (order_id, item_id, quantity, subtotal) VALUES (?,?,?,?)");
                $stmt2->execute([$orderId, (int)$ci["item_id"], $qty, $price * $qty]);
            }

            db()->commit();
        } catch (Exception $e) {
            db()->rollBack();
            respond(500, ["error" => "Order failed: " . $e->getMessage()]);
        }

        // Notify student (insert notification)
        $stmt = db()->prepare("INSERT INTO notifications (user_id, message, is_read, created_at) VALUES (?,?,0,NOW())");
        $stmt->execute([$user["user_id"], "Your order #$orderId has been placed and is awaiting confirmation."]);

        respond(201, ["message" => "Order placed successfully", "order_id" => $orderId, "total" => $total]);
    }

    /* GET /orders  — student's history */
    if (!$sub && method() === "GET") {
        $stmt = db()->prepare("
            SELECT o.*, v.restaurant_name
            FROM orders o
            JOIN vendors v ON v.vendor_id = o.vendor_id
            WHERE o.student_id = ?
            ORDER BY o.created_at DESC
            LIMIT 50
        ");
        $stmt->execute([$user["user_id"]]);
        respond(200, ["data" => $stmt->fetchAll()]);
    }

    /* GET /orders/{id} */
    if ($sub && !$action && method() === "GET") {
        $stmt = db()->prepare("
            SELECT o.*, v.restaurant_name,
                   GROUP_CONCAT(CONCAT(mi.name,' × ',oi.quantity) SEPARATOR ', ') AS items_summary
            FROM orders o
            JOIN vendors v   ON v.vendor_id = o.vendor_id
            JOIN orderitems oi ON oi.order_id = o.order_id
            JOIN menuitems  mi ON mi.item_id  = oi.item_id
            WHERE o.order_id = ? AND (o.student_id = ? OR ? = 'vendor' OR ? = 'admin')
            GROUP BY o.order_id
        ");
        $stmt->execute([(int)$sub, $user["user_id"], $user["role"], $user["role"]]);
        $order = $stmt->fetch();
        if (!$order) respond(404, ["error" => "Order not found"]);
        respond(200, ["data" => $order]);
    }

    /* PATCH /orders/{id}/status  — vendor updates status */
    if ($sub && $action === "status" && method() === "PATCH") {
        requireAuth("vendor", "admin");
        $newStatus = body()["status"] ?? "";
        $allowed   = ["Preparing", "Ready", "Completed", "Rejected"];
        if (!in_array($newStatus, $allowed, true)) {
            respond(400, ["error" => "Invalid status. Allowed: " . implode(", ", $allowed)]);
        }

        $stmt = db()->prepare("UPDATE orders SET status = ? WHERE order_id = ?");
        $stmt->execute([$newStatus, (int)$sub]);

        if (!$stmt->rowCount()) respond(404, ["error" => "Order not found"]);

        // Notify student
        $stmt2 = db()->prepare("SELECT student_id FROM orders WHERE order_id = ?");
        $stmt2->execute([(int)$sub]);
        $studentId = $stmt2->fetchColumn();
        if ($studentId) {
            $stmt3 = db()->prepare("INSERT INTO notifications (user_id, message, is_read, created_at) VALUES (?,?,0,NOW())");
            $stmt3->execute([$studentId, "Your order #{$sub} status has been updated to: $newStatus"]);
        }

        respond(200, ["message" => "Order status updated to $newStatus"]);
    }

    /* DELETE /orders/{id}  — cancel pending */
    if ($sub && method() === "DELETE") {
        $stmt = db()->prepare("UPDATE orders SET status = 'Rejected' WHERE order_id = ? AND student_id = ? AND status = 'Pending'");
        $stmt->execute([(int)$sub, $user["user_id"]]);
        if (!$stmt->rowCount()) respond(400, ["error" => "Cannot cancel this order"]);
        respond(200, ["message" => "Order cancelled"]);
    }

    respond(404, ["error" => "Order route not found"]);
}

/* ═══════════════════════════════════════════════════════════════
   VENDOR ROUTES
═══════════════════════════════════════════════════════════════ */
if ($resource === "vendor") {
    $user = requireAuth("vendor", "admin");

    /* GET /vendor/orders */
    if ($sub === "orders" && method() === "GET") {
        $stmt = db()->prepare("
            SELECT o.*, u.name AS student_name,
                   GROUP_CONCAT(CONCAT(mi.name,' × ',oi.quantity) SEPARATOR ', ') AS items_summary
            FROM orders o
            JOIN users u        ON u.id         = o.student_id
            JOIN vendors v      ON v.vendor_id  = o.vendor_id
            JOIN orderitems oi  ON oi.order_id  = o.order_id
            JOIN menuitems  mi  ON mi.item_id   = oi.item_id
            WHERE v.user_id = ?
            GROUP BY o.order_id
            ORDER BY o.created_at DESC
        ");
        $stmt->execute([$user["user_id"]]);
        respond(200, ["data" => $stmt->fetchAll()]);
    }

    /* GET /vendor/menu */
    if ($sub === "menu" && !$id && method() === "GET") {
        $stmt = db()->prepare("SELECT mi.* FROM menuitems mi JOIN vendors v ON v.vendor_id = mi.vendor_id WHERE v.user_id = ? ORDER BY mi.name");
        $stmt->execute([$user["user_id"]]);
        respond(200, ["data" => $stmt->fetchAll()]);
    }

    /* POST /vendor/menu — add item */
    if ($sub === "menu" && !$id && method() === "POST") {
        $b = body();
        $stmt = db()->prepare("SELECT vendor_id FROM vendors WHERE user_id = ?");
        $stmt->execute([$user["user_id"]]);
        $vendorId = $stmt->fetchColumn();
        if (!$vendorId) respond(403, ["error" => "Vendor profile not found"]);

        $stmt = db()->prepare("INSERT INTO menuitems (vendor_id, name, description, price, availability) VALUES (?,?,?,?,1)");
        $stmt->execute([$vendorId, $b["name"] ?? "", $b["description"] ?? "", (float)($b["price"] ?? 0)]);
        respond(201, ["message" => "Item added", "item_id" => (int)db()->lastInsertId()]);
    }

    /* PUT /vendor/menu/{id} — update item */
    if ($sub === "menu" && $id && !$action && method() === "PUT") {
        $b = body();
        $stmt = db()->prepare("UPDATE menuitems SET name=?, description=?, price=? WHERE item_id=?");
        $stmt->execute([$b["name"], $b["description"], (float)$b["price"], (int)$id]);
        respond(200, ["message" => "Item updated"]);
    }

    /* PATCH /vendor/menu/{id}/avail — toggle availability */
    if ($sub === "menu" && $id && $action === "avail" && method() === "PATCH") {
        $avail = (int)(body()["availability"] ?? 0);
        $stmt  = db()->prepare("UPDATE menuitems SET availability = ? WHERE item_id = ?");
        $stmt->execute([$avail, (int)$id]);
        respond(200, ["message" => "Availability updated"]);
    }

    /* GET /vendor/reports/daily */
    if ($sub === "reports" && $id === "daily" && method() === "GET") {
        $stmt = db()->prepare("
            SELECT
                COUNT(*)                                           AS total_orders,
                SUM(CASE WHEN status='Completed' THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN status='Rejected'  THEN 1 ELSE 0 END) AS rejected,
                SUM(CASE WHEN status='Completed' THEN total_price ELSE 0 END) AS revenue
            FROM orders o
            JOIN vendors v ON v.vendor_id = o.vendor_id
            WHERE v.user_id = ? AND DATE(o.created_at) = CURDATE()
        ");
        $stmt->execute([$user["user_id"]]);
        respond(200, ["data" => $stmt->fetch()]);
    }

    respond(404, ["error" => "Vendor route not found"]);
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN ROUTES
═══════════════════════════════════════════════════════════════ */
if ($resource === "admin") {
    requireAuth("admin");

    /* GET /admin/users */
    if ($sub === "users" && !$id && method() === "GET") {
        $users = db()->query("SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC")->fetchAll();
        respond(200, ["data" => $users]);
    }

    /* PATCH /admin/users/{id}/ban */
    if ($sub === "users" && $id && $action === "ban" && method() === "PATCH") {
        $newStatus = body()["status"] ?? "";
        if (!in_array($newStatus, ["active","banned"], true)) {
            respond(400, ["error" => "status must be active or banned"]);
        }
        $stmt = db()->prepare("UPDATE users SET status = ? WHERE id = ?");
        $stmt->execute([$newStatus, (int)$id]);
        respond(200, ["message" => "User status updated to $newStatus"]);
    }

    /* GET /admin/restaurants */
    if ($sub === "restaurants" && !$id && method() === "GET") {
        $vendors = db()->query("SELECT * FROM vendors ORDER BY restaurant_name")->fetchAll();
        respond(200, ["data" => $vendors]);
    }

    /* PATCH /admin/restaurants/{id} */
    if ($sub === "restaurants" && $id && method() === "PATCH") {
        $isOpen = (int)(body()["is_open"] ?? 0);
        $stmt   = db()->prepare("UPDATE vendors SET is_open = ? WHERE vendor_id = ?");
        $stmt->execute([$isOpen, (int)$id]);
        respond(200, ["message" => "Restaurant updated"]);
    }

    respond(404, ["error" => "Admin route not found"]);
}

/* ─── 404 Fallback ──────────────────────────────────────────── */
respond(404, ["error" => "Endpoint not found", "hint" => "Available resources: auth, restaurants, menu, orders, vendor, admin"]);
