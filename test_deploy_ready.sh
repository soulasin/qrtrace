#!/usr/bin/env bash

set -u

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

API="http://127.0.0.1:4000/api"
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() {
  echo "  ✅ $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo "  ❌ $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

warn() {
  echo "  ⚠️  $1"
  WARN_COUNT=$((WARN_COUNT + 1))
}

section() {
  echo
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

cleanup() {
  rm -f /tmp/qrtrace_test_response.json
  rm -f /tmp/qrtrace_test_headers.txt
}

trap cleanup EXIT

section "QRTrace Deployment Readiness Test"

echo "Project: $PROJECT_DIR"
echo "Date:    $(date)"
echo

# ------------------------------------------------------------
# 1. PROJECT FILES
# ------------------------------------------------------------

section "1. Project Files"

REQUIRED_FILES=(
  "package.json"
  "vite.config.js"
  "src/main.jsx"
  "src/App.jsx"
  "src/index.css"
  "server/index.cjs"
  "server/db.cjs"
  "server/schema.sql"
  "server/middleware/auth.cjs"
  "data/qrtrace.db"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    pass "$file"
  else
    fail "Missing: $file"
  fi
done

# ------------------------------------------------------------
# 2. NODE / NPM
# ------------------------------------------------------------

section "2. Node.js / NPM"

if command -v node >/dev/null 2>&1; then
  pass "Node.js $(node --version)"
else
  fail "Node.js not found"
fi

if command -v npm >/dev/null 2>&1; then
  pass "npm $(npm --version)"
else
  fail "npm not found"
fi

# ------------------------------------------------------------
# 3. NODE MODULES
# ------------------------------------------------------------

section "3. Dependencies"

if [ -d "node_modules" ]; then
  pass "node_modules exists"
else
  fail "node_modules missing"
fi

for pkg in express better-sqlite3 bcryptjs jsonwebtoken uuid cors dotenv react react-dom react-router-dom vite tailwindcss lucide-react qrcode qrcode.react; do
  if node -e "require.resolve('$pkg')" >/dev/null 2>&1; then
    pass "$pkg"
  else
    fail "$pkg missing"
  fi
done

# ------------------------------------------------------------
# 4. DATABASE
# ------------------------------------------------------------

section "4. SQLite Database"

DB_RESULT=$(node - <<'NODE'
try {
  const db = require('./server/db.cjs');

  const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
  `).all().map(x => x.name);

  const required = [
    'users',
    'categories',
    'category_fields',
    'products',
    'product_values',
    'qr_codes',
    'scan_logs'
  ];

  const missing = required.filter(x => !tables.includes(x));

  if (missing.length) {
    console.log('MISSING:' + missing.join(','));
    process.exit(1);
  }

  console.log('OK');
} catch (err) {
  console.log('ERROR:' + err.message);
  process.exit(1);
}
NODE
)

if [ "$DB_RESULT" = "OK" ]; then
  pass "All required database tables exist"
else
  fail "Database structure problem: $DB_RESULT"
fi

# ------------------------------------------------------------
# 5. DATABASE DATA
# ------------------------------------------------------------

section "5. Database Data"

DB_COUNTS=$(node - <<'NODE'
const db = require('./server/db.cjs');

const tables = [
  'users',
  'categories',
  'category_fields',
  'products',
  'product_values',
  'qr_codes',
  'scan_logs'
];

for (const table of tables) {
  const row = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();
  console.log(`${table}=${row.count}`);
}
NODE
)

echo "$DB_COUNTS"

USERS=$(echo "$DB_COUNTS" | awk -F= '$1=="users"{print $2}')
CATEGORIES=$(echo "$DB_COUNTS" | awk -F= '$1=="categories"{print $2}')
FIELDS=$(echo "$DB_COUNTS" | awk -F= '$1=="category_fields"{print $2}')
PRODUCTS=$(echo "$DB_COUNTS" | awk -F= '$1=="products"{print $2}')

[ "${USERS:-0}" -gt 0 ] && pass "Users exist" || fail "No users"
[ "${CATEGORIES:-0}" -gt 0 ] && pass "Categories exist" || fail "No categories"
[ "${FIELDS:-0}" -gt 0 ] && pass "Category fields exist" || warn "No category fields"
[ "${PRODUCTS:-0}" -gt 0 ] && pass "Products exist" || warn "No products"

# ------------------------------------------------------------
# 6. CATEGORY FIELD VALIDATION
# ------------------------------------------------------------

section "6. Dynamic Category Fields"

FIELD_CHECK=$(node - <<'NODE'
const db = require('./server/db.cjs');

const rows = db.prepare(`
  SELECT
    c.name AS category,
    cf.field_key,
    cf.field_label,
    cf.field_type
  FROM category_fields cf
  JOIN categories c
    ON c.id = cf.category_id
`).all();

if (!rows.length) {
  console.log('NO_FIELDS');
  process.exit(1);
}

const invalid = rows.filter(x =>
  !x.field_key ||
  !x.field_label ||
  !x.field_type
);

if (invalid.length) {
  console.log('INVALID_FIELDS');
  process.exit(1);
}

console.log(`OK:${rows.length}`);
NODE
)

if [[ "$FIELD_CHECK" == OK:* ]]; then
  pass "Dynamic fields valid ($FIELD_CHECK)"
else
  fail "Dynamic fields problem: $FIELD_CHECK"
fi

# ------------------------------------------------------------
# 7. FOREIGN KEY CHECK
# ------------------------------------------------------------

section "7. Database Integrity"

FK_RESULT=$(node - <<'NODE'
const db = require('./server/db.cjs');

const result = db.pragma('foreign_key_check');

if (result.length) {
  console.log('BROKEN');
  console.table(result);
  process.exit(1);
}

console.log('OK');
NODE
)

if [ "$FK_RESULT" = "OK" ]; then
  pass "Foreign key integrity OK"
else
  fail "Foreign key integrity problem"
fi

# ------------------------------------------------------------
# 8. BACKEND HEALTH
# ------------------------------------------------------------

section "8. Backend API"

if curl -fsS "$API/health" > /tmp/qrtrace_test_response.json 2>/dev/null; then
  if grep -q '"success":true' /tmp/qrtrace_test_response.json; then
    pass "GET /api/health"
    cat /tmp/qrtrace_test_response.json
    echo
  else
    fail "Health endpoint returned unexpected response"
  fi
else
  fail "Backend is not reachable at $API"
  echo
  echo "Start backend with:"
  echo "  npm run server"
fi

# ------------------------------------------------------------
# 9. FRONTEND BUILD
# ------------------------------------------------------------

section "9. Frontend Build"

if npm run build >/tmp/qrtrace_build.log 2>&1; then
  pass "npm run build"
else
  fail "npm run build failed"
  echo
  echo "--- Build Error ---"
  tail -n 80 /tmp/qrtrace_build.log
fi

# ------------------------------------------------------------
# 10. AUTH TEST
# ------------------------------------------------------------

section "10. Authentication API"

LOGIN_RESPONSE=$(curl -sS \
  -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
  pass "Admin login API"

  TOKEN=$(echo "$LOGIN_RESPONSE" | node -e "
    let s='';
    process.stdin.on('data',d=>s+=d);
    process.stdin.on('end',()=>{
      try {
        const j=JSON.parse(s);
        process.stdout.write(j.token || '');
      } catch {}
    });
  ")
else
  fail "Admin login failed"
  TOKEN=""
fi

if [ -n "$TOKEN" ]; then
  pass "JWT token received"
else
  fail "JWT token missing"
fi

# ------------------------------------------------------------
# 11. AUTHENTICATED CATEGORIES
# ------------------------------------------------------------

section "11. Categories API"

if [ -n "$TOKEN" ]; then

  CATEGORY_RESPONSE=$(curl -sS \
    "$API/categories" \
    -H "Authorization: Bearer $TOKEN")

  if echo "$CATEGORY_RESPONSE" | grep -q '"success":true'; then
    pass "GET /api/categories"
  else
    fail "GET /api/categories"
  fi

else
  warn "Skipped categories API because authentication failed"
fi

# ------------------------------------------------------------
# 12. AUTHENTICATED PRODUCTS
# ------------------------------------------------------------

section "12. Products API"

if [ -n "$TOKEN" ]; then

  PRODUCT_RESPONSE=$(curl -sS \
    "$API/products" \
    -H "Authorization: Bearer $TOKEN")

  if echo "$PRODUCT_RESPONSE" | grep -q '"success":true'; then
    pass "GET /api/products"
  else
    fail "GET /api/products"
  fi

else
  warn "Skipped products API because authentication failed"
fi

# ------------------------------------------------------------
# 13. DATABASE PRODUCT VALUES
# ------------------------------------------------------------

section "13. Product Dynamic Values"

VALUES_CHECK=$(node - <<'NODE'
const db = require('./server/db.cjs');

const products = db.prepare(`
  SELECT COUNT(*) AS count
  FROM products
`).get().count;

const values = db.prepare(`
  SELECT COUNT(*) AS count
  FROM product_values
`).get().count;

console.log(`products=${products}`);
console.log(`product_values=${values}`);

if (products > 0 && values > 0) {
  console.log('OK');
} else {
  console.log('EMPTY');
}
NODE
)

echo "$VALUES_CHECK"

if echo "$VALUES_CHECK" | grep -q '^OK$'; then
  pass "Product dynamic values exist in SQLite"
else
  warn "No product_values found — create a product with dynamic fields before deployment test"
fi

# ------------------------------------------------------------
# 14. QR DATABASE CHECK
# ------------------------------------------------------------

section "14. QR Code System"

QR_COUNT=$(node - <<'NODE'
const db = require('./server/db.cjs');

const row = db.prepare(`
  SELECT COUNT(*) AS count
  FROM qr_codes
`).get();

console.log(row.count);
NODE
)

echo "QR codes in database: $QR_COUNT"

if [ "${QR_COUNT:-0}" -gt 0 ]; then
  pass "QR codes exist in database"
else
  warn "No QR codes yet — generate at least one QR before deployment"
fi

# ------------------------------------------------------------
# 15. QR TOKEN TEST
# ------------------------------------------------------------

if [ "${QR_COUNT:-0}" -gt 0 ]; then

  section "15. Public QR API"

  QR_TOKEN=$(node - <<'NODE'
const db = require('./server/db.cjs');

const row = db.prepare(`
  SELECT token
  FROM qr_codes
  WHERE status = 'active'
  ORDER BY created_at DESC
  LIMIT 1
`).get();

if (row) console.log(row.token);
NODE
)

  if [ -n "$QR_TOKEN" ]; then

    QR_RESPONSE=$(curl -sS \
      "$API/qr/$QR_TOKEN")

    if echo "$QR_RESPONSE" | grep -q '"success":true'; then
      pass "GET /api/qr/:token"
    else
      fail "Public QR API failed"
      echo "$QR_RESPONSE"
    fi

  else
    fail "Could not obtain QR token"
  fi

else
  warn "Skipped public QR API test"
fi

# ------------------------------------------------------------
# 16. QR PRODUCT RELATION
# ------------------------------------------------------------

section "16. QR → Product Relationship"

QR_RELATION=$(node - <<'NODE'
const db = require('./server/db.cjs');

const row = db.prepare(`
  SELECT
    q.token,
    q.product_id,
    p.name AS product
  FROM qr_codes q
  JOIN products p
    ON p.id = q.product_id
  WHERE q.status = 'active'
  LIMIT 1
`).get();

if (row) {
  console.log('OK');
  console.log(`product=${row.product}`);
} else {
  console.log('EMPTY');
}
NODE
)

echo "$QR_RELATION"

if echo "$QR_RELATION" | grep -q '^OK$'; then
  pass "QR correctly linked to product"
else
  warn "No active QR → product relationship"
fi

# ------------------------------------------------------------
# 17. SCAN LOG DATABASE
# ------------------------------------------------------------

section "17. Scan Logs"

SCAN_TABLE=$(node - <<'NODE'
const db = require('./server/db.cjs');

try {
  db.prepare(`
    SELECT id
    FROM scan_logs
    LIMIT 1
  `).all();

  console.log('OK');
} catch (err) {
  console.log('ERROR');
  console.log(err.message);
}
NODE
)

if [ "$SCAN_TABLE" = "OK" ]; then
  pass "scan_logs table works"
else
  fail "scan_logs table problem"
fi

# ------------------------------------------------------------
# 18. SECURITY CHECK
# ------------------------------------------------------------

section "18. Basic Deployment Security"

if grep -q "admin123" server/seed.cjs 2>/dev/null; then
  warn "Default admin password admin123 is present in seed.cjs"
else
  pass "Default admin password not detected in seed.cjs"
fi

if [ -f ".env" ]; then
  if grep -q "JWT_SECRET=" .env; then
    SECRET=$(grep "^JWT_SECRET=" .env | cut -d= -f2-)

    if [ "${#SECRET}" -ge 32 ]; then
      pass "JWT_SECRET appears sufficiently long"
    else
      warn "JWT_SECRET is shorter than 32 characters"
    fi
  else
    warn "JWT_SECRET not configured in .env"
  fi
else
  warn ".env file not found"
fi

if grep -q "data/*.db" .gitignore 2>/dev/null; then
  pass "SQLite database ignored by git"
else
  warn "Check .gitignore: database files should not be committed"
fi

# ------------------------------------------------------------
# 19. FINAL DATABASE SUMMARY
# ------------------------------------------------------------

section "19. Final Database Summary"

node - <<'NODE'
const db = require('./server/db.cjs');

const tables = [
  'users',
  'categories',
  'category_fields',
  'products',
  'product_values',
  'qr_codes',
  'scan_logs'
];

for (const table of tables) {
  const row = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();
  console.log(`${table.padEnd(18)} ${row.count}`);
}
NODE

# ------------------------------------------------------------
# FINAL
# ------------------------------------------------------------

section "DEPLOYMENT READINESS RESULT"

echo
echo "Passed : $PASS_COUNT"
echo "Failed : $FAIL_COUNT"
echo "Warnings: $WARN_COUNT"
echo

if [ "$FAIL_COUNT" -eq 0 ] && [ "$WARN_COUNT" -eq 0 ]; then
  echo "🎉 QRTrace is READY FOR DEPLOYMENT"
  exit 0
elif [ "$FAIL_COUNT" -eq 0 ]; then
  echo "⚠️  QRTrace is FUNCTIONAL but has deployment warnings."
  echo "    Review the warnings before exposing it to the Internet."
  exit 0
else
  echo "❌ QRTrace is NOT READY FOR DEPLOYMENT."
  echo "   Fix the failed tests first."
  exit 1
fi
