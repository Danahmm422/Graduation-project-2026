/* ═══════════════════════════════════════════════════════════════
   Yamamah Eats — data.js
   All static data: restaurants, menus, seed orders, users
   ═══════════════════════════════════════════════════════════════ */

const RESTAURANTS = [
  {
    id: 1, name: "Barn's", emoji: "☕",
    location: "Student Centre – Ground Floor",
    open: true, rating: 4.8, time: "5–8 min",
    desc: "Saudi Arabia's first homegrown specialty coffee brand, founded 1992."
  },
  {
    id: 2, name: "Key Cafe", emoji: "🥐",
    location: "Main Building – Level 1",
    open: true, rating: 4.2, time: "6–10 min",
    desc: "Freshly baked pretzels, paninis, focaccia & hot beverages."
  },
  {
    id: 3, name: "Archi", emoji: "🫒",
    location: "Engineering Wing – Ground",
    open: true, rating: 4.6, time: "7–10 min",
    desc: "Specialty coffee, fresh sandwiches, salads & elegant desserts. Born in Khobar, 2021."
  },
  {
    id: 4, name: "Go Greek", emoji: "🍦",
    location: "Building B – Level 1",
    open: true, rating: 4.9, time: "5–8 min",
    desc: "Greek-inspired frozen & classic yogurt bowls. Originally from the USA."
  },
  {
    id: 5, name: "Al Mamlakh Sweets", emoji: "🍬",
    location: "Library Block",
    open: true, rating: 4.9, time: "5–8 min",
    desc: "Leading Arabic sweets chain since 1980 — kunafa, baklava, maamoul & more."
  },
  {
    id: 6, name: "Tropica", emoji: "🌴",
    location: "Outdoor Plaza",
    open: true, rating: 4.7, time: "4–7 min",
    desc: "Fresh tropical juices, fruit cocktails, smoothies & açaí bowls."
  },
  {
    id: 7, name: "Erleen's Burger", emoji: "🍔",
    location: "Sports Complex – Ground",
    open: true, rating: 4.6, time: "10–15 min",
    desc: "Saudi smash-burger chain — crispy, juicy & made fresh to order."
  },
  {
    id: 8, name: "Kafton", emoji: "🫓",
    location: "Building A – Ground Floor",
    open: true, rating: 4.4, time: "6–10 min",
    desc: "Popular local sandwich spot famous for liver, zinger & manakeesh-style breads."
  },
  {
    id: 10, name: "SPAR Express", emoji: "🛒",
    location: "Main Building – Basement",
    open: true, rating: 4.3, time: "2–5 min",
    desc: "SPAR Express & Bakery — fresh bakery, snacks, drinks & daily essentials."
  }
];

/* ─── Menus ────────────────────────────────────────────────── */
const MENUS = {

  /* Barn's */
  1: [
    { id: 101, name: "Saudi Coffee (Qahwa)",   desc: "Premium Saudi coffee with cardamom & saffron, served with dates", price: 16, emoji: "☕" },
    { id: 102, name: "Spanish Latte",          desc: "Espresso, steamed milk & sweetened condensed milk — a fan favourite", price: 20, emoji: "🥛" },
    { id: 103, name: "Caramel Mikato",         desc: "Barn's signature caramel espresso drink, rich & creamy",           price: 22, emoji: "🧋" },
    { id: 104, name: "Iced Shaken Coffee",     desc: "Fresh espresso shaken with chilled milk, smooth & bold",           price: 18, emoji: "🧊" },
    { id: 105, name: "Turkish Coffee",         desc: "Finely ground, aromatic & brewed to order",                        price: 14, emoji: "☕" },
    { id: 106, name: "Matcha Latte",           desc: "Premium matcha with steamed milk",                                 price: 20, emoji: "🍵" },
    { id: 107, name: "Hot Chocolate",          desc: "Rich & creamy with your choice of toppings",                       price: 18, emoji: "🍫" },
    { id: 108, name: "Cheese Sandwich",        desc: "Toasted bread with melted cheese",                                 price: 16, emoji: "🧀" },
    { id: 109, name: "Croissant",              desc: "Buttery, freshly baked croissant",                                 price: 14, emoji: "🥐" },
    { id: 110, name: "Oreo Frappe",            desc: "Blended Oreo biscuits with chocolate & milk — a Barn's original",  price: 24, emoji: "🍪" }
  ],

  /* Key Cafe */
  2: [
    { id: 201, name: "Turkey Pretzel",         desc: "Freshly baked pretzel loaded with turkey & delicious filling",     price: 25, emoji: "🥨" },
    { id: 202, name: "Pretzel Feta Cheese",    desc: "Pretzel stuffed with cheese & spinach",                            price: 21, emoji: "🥨" },
    { id: 203, name: "Four Cheese Focaccia",   desc: "Italian focaccia bread stuffed with special cheeses",              price: 29, emoji: "🍞" },
    { id: 204, name: "Croissant Zaatar",       desc: "Croissant stuffed with zaatar and cheese",                         price: 19, emoji: "🥐" },
    { id: 205, name: "Cheese Croissant",       desc: "Flaky croissant stuffed with melted cheese",                       price: 19, emoji: "🥐" },
    { id: 206, name: "Chicken Panini",         desc: "Chicken pieces in panini bread with ranch sauce & cheese",         price: 18, emoji: "🥪" },
    { id: 207, name: "Mini Pancakes",          desc: "Fluffy mini pancakes with syrup & toppings",                       price: 23, emoji: "🥞" },
    { id: 208, name: "Hot Dog Box",            desc: "5 pieces of hotdog sandwiches — great for sharing",                price: 99, emoji: "🌭" },
    { id: 209, name: "Cappuccino",             desc: "Espresso, steamed milk, velvety micro-foam",                       price: 16, emoji: "☕" },
    { id: 210, name: "Iced Latte",             desc: "Chilled espresso over ice with milk",                              price: 18, emoji: "🧊" }
  ],

  /* Archi */
  3: [
    { id: 301, name: "Archi Signature Salad",  desc: "Baby spinach, cabbage, parmesan, sesame, Archi's signature sauce", price: 28, emoji: "🥗" },
    { id: 302, name: "Burrata Ciabatta",       desc: "Ciabatta, burrata, baby rocket, cherry tomatoes, pesto",           price: 36, emoji: "🥪" },
    { id: 303, name: "Halloumi & Egg Sandwich",desc: "Grilled halloumi, soft egg, rocket, avocado, balsamic drizzle",   price: 34, emoji: "🥙" },
    { id: 304, name: "Turkey Avocado",         desc: "Turkey slices, mozzarella, avocado, hot sauce, pesto on ciabatta", price: 32, emoji: "🥪" },
    { id: 305, name: "Ethiopian Flat White",   desc: "Smooth Ethiopian coffee beans with silky steamed milk",            price: 20, emoji: "☕" },
    { id: 306, name: "Brazilian Affogato",     desc: "Brazilian coffee poured over rich vanilla ice cream",              price: 26, emoji: "🍦" },
    { id: 307, name: "Tiramisu",               desc: "Classic layered tiramisu with cream & cocoa — Archi's favourite",  price: 28, emoji: "🎂" },
    { id: 308, name: "Fresh Orange Juice",     desc: "Squeezed to order — refreshing & pure",                           price: 16, emoji: "🍊" },
    { id: 309, name: "Archi Sandwich Platter", desc: "12 bite-sized sandwiches, golden sticks, selection of sauces",    price: 65, emoji: "🍱" },
    { id: 310, name: "White Mocha Latte",      desc: "Ethiopian coffee, steamed milk & white chocolate sauce",           price: 22, emoji: "🍵" }
  ],

  /* Go Greek */
  4: [
    { id: 401, name: "Classic Frozen Yogurt",  desc: "Creamy Greek-style frozen yogurt — choose your flavour",          price: 22, emoji: "🍦" },
    { id: 402, name: "Yogurt Bowl",            desc: "Greek yogurt base with fresh fruit, granola & honey drizzle",     price: 28, emoji: "🥣" },
    { id: 403, name: "Pistachio Yogurt",       desc: "Signature frozen yogurt topped with crushed pistachios",          price: 26, emoji: "🍦" },
    { id: 404, name: "Tzatziki & Pita",        desc: "Greek yogurt, garlic, dill & cucumber dip with grilled pita",    price: 18, emoji: "🫓" },
    { id: 405, name: "Greek Salad",            desc: "Tomato, cucumber, olives, feta, onion & oregano",                price: 24, emoji: "🥗" },
    { id: 406, name: "Chicken Gyro",           desc: "Marinated chicken, pita bread, tzatziki, tomato & onion",        price: 28, emoji: "🌯" },
    { id: 407, name: "Baklava",                desc: "Layered phyllo pastry, walnuts & honey — baked golden",          price: 16, emoji: "🍯" },
    { id: 408, name: "Spanakopita",            desc: "Spinach & feta cheese pie with flaky phyllo pastry",             price: 20, emoji: "🥧" },
    { id: 409, name: "Feta Fries",             desc: "Roasted fries topped with crumbled feta, lemon & oregano",       price: 18, emoji: "🍟" },
    { id: 410, name: "Lemon Potatoes",         desc: "Oven-roasted potatoes with lemon, garlic & herbs",               price: 16, emoji: "🥔" }
  ],

  /* Al Mamlakh Sweets */
  5: [
    { id: 501, name: "Roasted Milk Kunafa",    desc: "Soft & crispy kunafa enriched with roasted milk flavour",        price: 28, emoji: "🍮" },
    { id: 502, name: "Classic Kunafa",         desc: "Traditional cheese kunafa soaked in rose water syrup",           price: 25, emoji: "🍮" },
    { id: 503, name: "Pistachio Baklava",      desc: "Crunchy golden layers, cashews & pistachio crunch",              price: 22, emoji: "🍯" },
    { id: 504, name: "Belgian Chocolate Tray", desc: "Kunafa-pistachio, almond cream, cappuccino filled chocolates",   price: 45, emoji: "🍫" },
    { id: 505, name: "Date Maamoul",           desc: "Buttery shortbread cookies stuffed with premium dates",          price: 20, emoji: "🍪" },
    { id: 506, name: "Walnut Maamoul",         desc: "Delicate maamoul filled with fresh walnuts & dates",             price: 20, emoji: "🍪" },
    { id: 507, name: "Date Cake",              desc: "Soft date cake with caramel sauce & roasted pecan pieces",       price: 32, emoji: "🎂" },
    { id: 508, name: "Saffron Cake",           desc: "Fluffy sponge soaked in saffron & milk — luxurious taste",       price: 35, emoji: "🌾" },
    { id: 509, name: "Mango Truffle",          desc: "Natural mango blended with fresh cream & cake layers",           price: 30, emoji: "🥭" },
    { id: 510, name: "Luqaimat",               desc: "Crispy fried dough balls drizzled with date syrup & sesame",     price: 18, emoji: "🟡" }
  ],

  /* Tropica */
  6: [
    { id: 601, name: "Mango Juice",            desc: "Pure fresh mango, squeezed to order",                            price: 16, emoji: "🥭" },
    { id: 602, name: "Watermelon Cooler",      desc: "Fresh watermelon, mint & a squeeze of lime",                    price: 14, emoji: "🍉" },
    { id: 603, name: "Tropical Cocktail",      desc: "Mango, strawberry, guava, ice cream & Nutella blend",           price: 22, emoji: "🍍" },
    { id: 604, name: "Berry Boost Smoothie",   desc: "Strawberry, blueberry, banana & yoghurt, blended creamy",       price: 20, emoji: "🍓" },
    { id: 605, name: "Green Detox Juice",      desc: "Spinach, green apple, cucumber, lemon & ginger",                price: 20, emoji: "🥬" },
    { id: 606, name: "Açaí Bowl",              desc: "Açaí base, fresh fruit, granola, coconut & honey drizzle",      price: 28, emoji: "🫐" },
    { id: 607, name: "Fruit Salad Cup",        desc: "Seasonal mixed fruit — banana, strawberry, kiwi, pineapple",   price: 16, emoji: "🍓" },
    { id: 608, name: "Pomegranate Lemonade",   desc: "Fresh pomegranate & lemon, lightly sweetened",                 price: 18, emoji: "🍋" },
    { id: 609, name: "Avocado Smoothie",       desc: "Creamy avocado, honey, milk, blended smooth",                  price: 22, emoji: "🥑" },
    { id: 610, name: "Strawberry Milkshake",   desc: "Fresh strawberries, vanilla ice cream & milk",                 price: 20, emoji: "🍓" }
  ],

  /* Erleen's Burger */
  7: [
    { id: 701, name: "Erleen's Classic Burger",desc: "Smash beef patty, special Erleen's sauce & pickles",           price: 28, emoji: "🍔" },
    { id: 702, name: "Double Smash Burger",    desc: "Two smashed patties, double cheese & caramelised onions",      price: 36, emoji: "🍔" },
    { id: 703, name: "Crispy Chicken Burger",  desc: "Crispy fried chicken fillet, coleslaw & sriracha mayo",        price: 26, emoji: "🥪" },
    { id: 704, name: "Mushroom Swiss Burger",  desc: "Beef patty, sautéed mushrooms & melted Swiss cheese",          price: 30, emoji: "🍔" },
    { id: 705, name: "Zinger Burger",          desc: "Crispy spicy chicken fillet, fresh bun & sauce",               price: 24, emoji: "🔥" },
    { id: 706, name: "Loaded Fries",           desc: "Crinkle-cut fries with cheese sauce & toppings",               price: 18, emoji: "🍟" },
    { id: 707, name: "Regular Fries",          desc: "Classic golden fries, crispy & hot",                           price: 12, emoji: "🍟" },
    { id: 708, name: "Onion Rings",            desc: "Golden battered onion rings with dipping sauce",               price: 14, emoji: "🧅" },
    { id: 709, name: "Chocolate Milkshake",    desc: "Thick blended chocolate milkshake",                            price: 20, emoji: "🥤" },
    { id: 710, name: "Strawberry Milkshake",   desc: "Thick blended strawberry milkshake",                           price: 20, emoji: "🥤" }
  ],

  /* Kafton */
  8: [
    { id: 801, name: "Liver Sandwich",         desc: "Classic liver cooked with fresh vegetables in bread",           price: 14, emoji: "🫓" },
    { id: 802, name: "Cheese Liver Sandwich",  desc: "Spiced liver with vegetables & melted cheese",                  price: 16, emoji: "🫓" },
    { id: 803, name: "Truffle Liver Sandwich", desc: "Fresh liver with vegetables & truffle sauce",                   price: 17, emoji: "🍄" },
    { id: 804, name: "Zinger Sandwich",        desc: "Crispy spicy chicken burger — Kafton style",                   price: 18, emoji: "🔥" },
    { id: 805, name: "Chicken Sandwich",       desc: "Marinated chicken sandwich, juicy & flavourful",               price: 14, emoji: "🥪" },
    { id: 806, name: "Falafel Sandwich",       desc: "Mixed falafel with vegetables & tahini sauce in bread",        price:  8, emoji: "🧆" },
    { id: 807, name: "Fried Egg & Cheese",     desc: "Golden fried egg with cheese on fresh bread",                  price:  8, emoji: "🍳" },
    { id: 808, name: "Nutella Tahini",         desc: "Thin baked dough stuffed with Nutella sauce",                  price: 12, emoji: "🍫" },
    { id: 809, name: "Liquid Cheese Pie",      desc: "Freshly baked pie stuffed with warm cream cheese",             price:  6, emoji: "🧀" },
    { id: 810, name: "Karak Tea",              desc: "Rich spiced tea with cardamom & evaporated milk",              price:  8, emoji: "☕" }
  ],

  /* SPAR Express */
  10: [
    { id: 1001, name: "Fresh Bakery Croissant",desc: "SPAR's own freshly baked butter croissant",                    price:  8, emoji: "🥐" },
    { id: 1002, name: "Water Bottle 500ml",    desc: "Still or sparkling, chilled",                                  price:  4, emoji: "💧" },
    { id: 1003, name: "Energy Drink",          desc: "Assorted brands — Red Bull, Monster & more",                   price:  9, emoji: "⚡" },
    { id: 1004, name: "Chilled Sandwich",      desc: "Pre-made chilled sandwich — chicken, tuna or cheese",          price: 14, emoji: "🥪" },
    { id: 1005, name: "Chocolate Bar",         desc: "Assorted brands — KitKat, Snickers, Twix & more",             price:  5, emoji: "🍫" },
    { id: 1006, name: "Chips / Crisps",        desc: "Various flavours — Lays, Pringles & local brands",            price:  5, emoji: "🍿" },
    { id: 1007, name: "Greek Yoghurt Cup",     desc: "Creamy yoghurt with fruit on the bottom",                      price:  8, emoji: "🫙" },
    { id: 1008, name: "Fresh Fruit Cup",       desc: "Seasonal mixed fruit, chilled & ready to eat",                 price: 10, emoji: "🍓" },
    { id: 1009, name: "Juice Box 200ml",       desc: "Assorted flavours — mango, orange, apple",                     price:  5, emoji: "🧃" },
    { id: 1010, name: "Hot Coffee (Self-Serve)",desc: "Freshly brewed coffee from SPAR's in-store machine",          price:  6, emoji: "☕" }
  ]
};

/* ─── Seed Orders ──────────────────────────────────────────── */
const SEED_ORDERS = [
  { id: "ORD-001", student: "Sara Al-Rashid",  items: "Spanish Latte × 1, Croissant × 2",              total: 48, status: "Pending",   time: "10:32 AM" },
  { id: "ORD-002", student: "Khalid Mansour",  items: "Saudi Coffee × 2, Cheese Sandwich × 1",          total: 48, status: "Preparing", time: "10:28 AM" },
  { id: "ORD-003", student: "Lina Hamed",      items: "Caramel Mikato × 1, Oreo Frappe × 1",            total: 46, status: "Ready",     time: "10:15 AM" },
  { id: "ORD-004", student: "Ahmed Nasser",    items: "Matcha Latte × 1, Iced Shaken Coffee × 1",       total: 38, status: "Completed", time: "10:05 AM" },
  { id: "ORD-005", student: "Noor Al-Qahtani",items: "Hot Chocolate × 2, Turkish Coffee × 1",          total: 50, status: "Rejected",  time: "09:58 AM" }
];

/* ─── Users ────────────────────────────────────────────────── */
const SEED_USERS = [
  { id:  1, name: "Sara Al-Rashid",  email: "sara@yu.edu.sa",     role: "student", status: "active" },
  { id:  2, name: "Barn's",          email: "barnz@yu.edu.sa",    role: "vendor",  status: "active" },
  { id:  3, name: "Khalid Mansour",  email: "khalid@yu.edu.sa",   role: "student", status: "active" },
  { id:  4, name: "Admin Team",      email: "admin@yu.edu.sa",    role: "admin",   status: "active" },
  { id:  5, name: "Lina Hamed",      email: "lina@yu.edu.sa",     role: "student", status: "banned"  },
  { id:  6, name: "Erleen's Burger", email: "erleens@yu.edu.sa",  role: "vendor",  status: "active" },
  { id:  7, name: "Go Greek",        email: "gogreek@yu.edu.sa",  role: "vendor",  status: "active" },
  { id:  8, name: "Al Mamlakh",      email: "mamlakh@yu.edu.sa",  role: "vendor",  status: "active" },
  { id:  9, name: "Noor Al-Qahtani",email: "noor@yu.edu.sa",     role: "student", status: "active" },
  { id: 10, name: "SPAR Express",    email: "spar@yu.edu.sa",     role: "vendor",  status: "active" },
  { id: 11, name: "Key Cafe",        email: "keycafe@yu.edu.sa",  role: "vendor",  status: "active" },
  { id: 12, name: "Archi",           email: "archi@yu.edu.sa",    role: "vendor",  status: "active" },
  { id: 13, name: "Kafton",          email: "kafton@yu.edu.sa",   role: "vendor",  status: "active" },
  { id: 14, name: "Tropica",         email: "tropica@yu.edu.sa",  role: "vendor",  status: "active" }
];
