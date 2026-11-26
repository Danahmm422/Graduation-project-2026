-- ═══════════════════════════════════════════════════════════════
-- Yamamah Eats — db.sql
-- Al Yamamah University Campus Food Ordering System
-- ═══════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS yamamah_eats CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yamamah_eats;

-- ─── Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(100)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  role       ENUM('student','vendor','admin') DEFAULT 'student',
  status     ENUM('active','banned')          DEFAULT 'active',
  created_at DATETIME DEFAULT NOW()
);

-- ─── Insert Group Members ────────────────────────────────────
-- Password: 123456789 (hashed with bcrypt)
INSERT INTO users (name, email, password, role, status) VALUES
('Danah Almowinea', 'danah@yu.edu.sa',   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',   'active'),
('Alaa Alhomayem',  'alaa@yu.edu.sa',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active'),
('Shaimaa Seror',   'shaimaa@yu.edu.sa', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vendor',  'active'),
('Rafeef Ajeeb',    'rafeef@yu.edu.sa',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'active');

-- ─── Vendors ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  vendor_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  restaurant_name VARCHAR(120) NOT NULL,
  location        VARCHAR(100),
  is_open         TINYINT(1) DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO vendors (user_id, restaurant_name, location, is_open) VALUES
(3, "Barn's",            'Student Centre – Ground Floor', 1),
(3, 'Key Cafe',          'Main Building – Level 1',       1),
(3, 'Archi',             'Engineering Wing – Ground',     1),
(3, 'Go Greek',          'Building B – Level 1',          1),
(3, 'Al Mamlakh Sweets', 'Library Block',                 1),
(3, 'Tropica',           'Outdoor Plaza',                 1),
(3, "Erleen's Burger",   'Sports Complex – Ground',       1),
(3, 'Kafton',            'Building A – Ground Floor',     1),
(3, 'SPAR Express',      'Main Building – Basement',      1);

-- ─── Menu Items ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menuitems (
  item_id      INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id    INT NOT NULL,
  name         VARCHAR(120) NOT NULL,
  description  VARCHAR(255),
  price        DECIMAL(6,2) NOT NULL,
  availability TINYINT(1) DEFAULT 1,
  FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
);

-- Barn's menu (vendor_id=1)
INSERT INTO menuitems (vendor_id, name, description, price) VALUES
(1, 'Saudi Coffee (Qahwa)',  'Premium Saudi coffee with cardamom & saffron', 16.00),
(1, 'Spanish Latte',         'Espresso, steamed milk & condensed milk',      20.00),
(1, 'Caramel Mikato',        'Signature caramel espresso drink',             22.00),
(1, 'Iced Shaken Coffee',    'Espresso shaken with chilled milk',            18.00),
(1, 'Turkish Coffee',        'Finely ground, aromatic & brewed to order',    14.00),
(1, 'Matcha Latte',          'Premium matcha with steamed milk',             20.00),
(1, 'Hot Chocolate',         'Rich & creamy hot chocolate',                  18.00),
(1, 'Cheese Sandwich',       'Toasted bread with melted cheese',             16.00),
(1, 'Croissant',             'Buttery, freshly baked croissant',             14.00),
(1, 'Oreo Frappe',           'Blended Oreo with chocolate & milk',           24.00);

-- ─── Orders ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  order_id       INT AUTO_INCREMENT PRIMARY KEY,
  student_id     INT NOT NULL,
  vendor_id      INT NOT NULL,
  total_price    DECIMAL(8,2) NOT NULL,
  status         ENUM('Pending','Preparing','Ready','Completed','Rejected') DEFAULT 'Pending',
  payment_method ENUM('Online','Cash') DEFAULT 'Cash',
  created_at     DATETIME DEFAULT NOW(),
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (vendor_id)  REFERENCES vendors(vendor_id)
);

-- ─── Order Items ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orderitems (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  item_id       INT NOT NULL,
  quantity      INT NOT NULL DEFAULT 1,
  subtotal      DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (item_id)  REFERENCES menuitems(item_id)
);

-- ─── Payments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  payment_id       INT AUTO_INCREMENT PRIMARY KEY,
  order_id         INT NOT NULL,
  amount           DECIMAL(8,2) NOT NULL,
  payment_status   ENUM('Success','Failed','Refunded') DEFAULT 'Success',
  transaction_time DATETIME DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ─── Notifications ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  notif_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  message    VARCHAR(255),
  is_read    TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ─── Sessions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  session_id  VARCHAR(64) PRIMARY KEY,
  user_id     INT NOT NULL,
  created_at  DATETIME DEFAULT NOW(),
  expires_at  DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

