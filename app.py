import os, threading, logging, uuid
from datetime import datetime, date
from flask import Flask, jsonify, request, session, redirect, url_for, render_template
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import ThreadedConnectionPool

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

app = Flask(__name__, template_folder="templates")
app.secret_key = os.environ.get("SECRET_KEY") or (
    os.environ.get("RAILWAY_PROJECT_ID", "local") + "-" +
    os.environ.get("RAILWAY_SERVICE_ID", "dev")
)
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
DATABASE_URL   = os.environ.get("DATABASE_URL")

# ── DB Pool ───────────────────────────────────────────────────────────────────
_pool = None
_pool_lock = threading.Lock()

def get_pool():
    global _pool
    if _pool is None:
        with _pool_lock:
            if _pool is None:
                _pool = ThreadedConnectionPool(1, 10, dsn=DATABASE_URL, cursor_factory=RealDictCursor)
    return _pool

_pool_conns = set()

def get_db():
    try:
        conn = get_pool().getconn()
        conn.autocommit = False
        _pool_conns.add(id(conn))
        return conn
    except Exception:
        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def release_db(conn):
    try:
        if id(conn) in _pool_conns:
            _pool_conns.discard(id(conn))
            get_pool().putconn(conn)
        else:
            conn.close()
    except Exception:
        try: conn.close()
        except: pass

# ── Schema ────────────────────────────────────────────────────────────────────
def ensure_db():
    conn = get_db(); cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS stores (
            id              SERIAL PRIMARY KEY,
            name            TEXT NOT NULL,
            category        TEXT DEFAULT '',
            address         TEXT DEFAULT '',
            phone           TEXT DEFAULT '',
            instagram       TEXT DEFAULT '',
            description     TEXT DEFAULT '',
            menu_image_url  TEXT DEFAULT '',
            menu_tags       TEXT[] DEFAULT '{}',
            price_range     TEXT DEFAULT '',
            admin_token     TEXT DEFAULT '',
            last_confirmed_at TIMESTAMP,
            is_active       BOOLEAN DEFAULT TRUE,
            updated_at      TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS store_hours (
            id          SERIAL PRIMARY KEY,
            store_id    INTEGER REFERENCES stores(id) ON DELETE CASCADE,
            day_of_week INTEGER,
            open_time   TEXT DEFAULT '',
            close_time  TEXT DEFAULT '',
            break_start TEXT DEFAULT '',
            break_end   TEXT DEFAULT '',
            is_day_off  BOOLEAN DEFAULT FALSE
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS store_exceptions (
            id         SERIAL PRIMARY KEY,
            store_id   INTEGER REFERENCES stores(id) ON DELETE CASCADE,
            date       DATE NOT NULL,
            type       TEXT DEFAULT 'closed',
            open_time  TEXT DEFAULT '',
            close_time TEXT DEFAULT '',
            note       TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_hours_store   ON store_hours(store_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_exc_store_date ON store_exceptions(store_id, date)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_stores_active  ON stores(is_active)")
    conn.commit(); cur.close(); release_db(conn)

# ── 영업 여부 판단 (HH:MM 문자열 비교) ───────────────────────────────────────
def is_open_at(t, open_t, close_t, break_s='', break_e=''):
    if not open_t or not close_t:
        return False
    if not (open_t <= t <= close_t):
        return False
    if break_s and break_e and break_s <= t <= break_e:
        return False
    return True

# ── 공개 API ──────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/stores")
def api_stores():
    date_str  = request.args.get("date", date.today().isoformat())
    time_str  = request.args.get("time", datetime.now().strftime("%H:%M"))
    category  = request.args.get("category", "")
    open_only = request.args.get("open_only", "") == "true"

    try:
        d = datetime.strptime(date_str, "%Y-%m-%d").date()
    except Exception:
        d = date.today()

    # EXTRACT(DOW): 0=일, 1=월 … 6=토  /  Python weekday(): 0=월 … 6=일
    dow = (d.weekday() + 1) % 7

    conn = get_db(); cur = conn.cursor()
    sql = """
        WITH exc AS (
            SELECT store_id, type, open_time, close_time, note
            FROM   store_exceptions WHERE date = %s
        ),
        hrs AS (
            SELECT store_id, open_time, close_time, break_start, break_end, is_day_off
            FROM   store_hours WHERE day_of_week = %s
        )
        SELECT s.id, s.name, s.category, s.address, s.phone, s.instagram,
               s.description, s.menu_image_url, s.menu_tags, s.price_range,
               COALESCE(NULLIF(e.open_time,''),  NULLIF(h.open_time,''),  '') AS today_open,
               COALESCE(NULLIF(e.close_time,''), NULLIF(h.close_time,''), '') AS today_close,
               COALESCE(h.break_start, '') AS break_start,
               COALESCE(h.break_end,   '') AS break_end,
               COALESCE(h.is_day_off,  FALSE) AS is_day_off,
               e.type AS exc_type,
               COALESCE(e.note, '') AS exc_note
        FROM   stores s
        LEFT JOIN exc e ON e.store_id = s.id
        LEFT JOIN hrs h ON h.store_id = s.id
        WHERE  s.is_active = TRUE
    """
    params = [str(d), dow]
    if category:
        sql += " AND s.category = %s"; params.append(category)
    sql += " ORDER BY s.category, s.name"

    cur.execute(sql, params)
    rows = [dict(r) for r in cur.fetchall()]
    cur.close(); release_db(conn)

    for r in rows:
        exc = r.pop('exc_type', None)
        is_off = r.pop('is_day_off', False)
        bs = r.pop('break_start', '')
        be = r.pop('break_end', '')
        en = r.pop('exc_note', '')

        if exc == 'closed' or is_off:
            r['is_open'] = False
            r['closed_reason'] = en if en else ('임시휴무' if exc == 'closed' else '정기휴무')
        elif exc == 'special_hours':
            r['is_open'] = is_open_at(time_str, r['today_open'], r['today_close'])
            r['closed_reason'] = ''
        else:
            r['is_open'] = is_open_at(time_str, r['today_open'], r['today_close'], bs, be)
            r['closed_reason'] = ''
            if bs and be:
                r['break'] = f"{bs}–{be}"

    if open_only:
        rows = [r for r in rows if r['is_open']]

    return jsonify(rows)

@app.route("/api/stores/<int:store_id>")
def api_store_detail(store_id):
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT * FROM stores WHERE id = %s AND is_active = TRUE", (store_id,))
    row = cur.fetchone()
    if not row:
        cur.close(); release_db(conn); return jsonify({}), 404
    store = dict(row)
    store.pop('admin_token', None)

    cur.execute("SELECT * FROM store_hours WHERE store_id = %s ORDER BY day_of_week", (store_id,))
    hours = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT * FROM store_exceptions
        WHERE store_id = %s AND date >= CURRENT_DATE ORDER BY date
    """, (store_id,))
    exceptions = [dict(r) for r in cur.fetchall()]
    for e in exceptions:
        e['date'] = str(e['date'])

    cur.close(); release_db(conn)
    return jsonify({"store": store, "hours": hours, "exceptions": exceptions})

# ── 사장님 관리 (토큰) ────────────────────────────────────────────────────────
@app.route("/manage/<token>")
def manage_page(token):
    return render_template("manage.html", token=token)

@app.route("/api/manage/<token>")
def api_manage_get(token):
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT * FROM stores WHERE admin_token = %s", (token,))
    row = cur.fetchone()
    if not row:
        cur.close(); release_db(conn); return jsonify({"error": "not found"}), 404
    store = dict(row)
    store_id = store['id']

    cur.execute("SELECT * FROM store_hours WHERE store_id = %s ORDER BY day_of_week", (store_id,))
    hours = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT * FROM store_exceptions WHERE store_id = %s AND date >= CURRENT_DATE ORDER BY date
    """, (store_id,))
    exceptions = [dict(r) for r in cur.fetchall()]
    for e in exceptions:
        e['date'] = str(e['date'])

    cur.execute("""
        SELECT id FROM store_exceptions
        WHERE store_id = %s AND date = CURRENT_DATE AND type = 'closed'
    """, (store_id,))
    is_closed_today = cur.fetchone() is not None

    cur.close(); release_db(conn)
    return jsonify({"store": store, "hours": hours, "exceptions": exceptions,
                    "is_closed_today": is_closed_today})

@app.route("/api/manage/<token>", methods=["PUT"])
def api_manage_put(token):
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT id FROM stores WHERE admin_token = %s", (token,))
    row = cur.fetchone()
    if not row:
        cur.close(); release_db(conn); return jsonify({"error": "not found"}), 404
    store_id = row['id']
    d = request.get_json()
    cur.execute("""
        UPDATE stores SET
            description=%s, phone=%s, instagram=%s,
            menu_image_url=%s, menu_tags=%s, price_range=%s,
            last_confirmed_at=NOW(), updated_at=NOW()
        WHERE id=%s
    """, (d.get('description',''), d.get('phone',''), d.get('instagram',''),
          d.get('menu_image_url',''), d.get('menu_tags',[]),
          d.get('price_range',''), store_id))
    conn.commit(); cur.close(); release_db(conn)
    return jsonify({"ok": True})

@app.route("/api/manage/<token>/exception", methods=["POST"])
def api_manage_exception(token):
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT id FROM stores WHERE admin_token = %s", (token,))
    row = cur.fetchone()
    if not row:
        cur.close(); release_db(conn); return jsonify({"error": "not found"}), 404
    store_id = row['id']
    d = request.get_json() or {}
    target_date = d.get('date', date.today().isoformat())
    note = d.get('note', '')

    cur.execute("""
        SELECT id FROM store_exceptions
        WHERE store_id=%s AND date=%s AND type='closed'
    """, (store_id, target_date))
    existing = cur.fetchone()
    if existing:
        cur.execute("DELETE FROM store_exceptions WHERE id=%s", (existing['id'],))
        action = "removed"
    else:
        cur.execute("""
            INSERT INTO store_exceptions (store_id, date, type, note)
            VALUES (%s, %s, 'closed', %s)
        """, (store_id, target_date, note))
        action = "added"
    conn.commit(); cur.close(); release_db(conn)
    return jsonify({"ok": True, "action": action})

# ── 어드민 ────────────────────────────────────────────────────────────────────
@app.route("/admin", methods=["GET", "POST"])
def admin():
    if not ADMIN_PASSWORD:
        return "ADMIN_PASSWORD 환경변수를 설정해주세요.", 503
    if request.method == "POST":
        if request.form.get("password") == ADMIN_PASSWORD:
            session["admin"] = True
            return redirect(url_for("admin_dashboard"))
        return render_template("admin.html", login_mode=True, error="비밀번호가 틀렸습니다.")
    if session.get("admin"):
        return redirect(url_for("admin_dashboard"))
    return render_template("admin.html", login_mode=True, error=None)

@app.route("/admin/dashboard")
def admin_dashboard():
    if not session.get("admin"):
        return redirect(url_for("admin"))
    conn = get_db(); cur = conn.cursor()
    cur.execute("""
        SELECT s.*, COUNT(sh.id) AS hours_count
        FROM   stores s
        LEFT JOIN store_hours sh ON sh.store_id = s.id
        GROUP BY s.id ORDER BY s.category, s.name
    """)
    stores = [dict(r) for r in cur.fetchall()]
    cur.close(); release_db(conn)
    return render_template("admin.html", login_mode=False, stores=stores)

@app.route("/admin/logout")
def admin_logout():
    session.pop("admin", None)
    return redirect(url_for("admin"))

@app.route("/admin/store/save", methods=["POST"])
def admin_store_save():
    if not session.get("admin"): return redirect(url_for("admin"))
    d = request.form
    tags = [t.strip() for t in d.get("menu_tags","").split(",") if t.strip()]
    conn = get_db(); cur = conn.cursor()
    store_id = d.get("id","").strip()
    if store_id:
        cur.execute("""
            UPDATE stores SET name=%s, category=%s, address=%s, phone=%s,
                instagram=%s, description=%s, menu_image_url=%s,
                menu_tags=%s, price_range=%s, is_active=%s, updated_at=NOW()
            WHERE id=%s
        """, (d['name'], d.get('category',''), d.get('address',''), d.get('phone',''),
              d.get('instagram',''), d.get('description',''), d.get('menu_image_url',''),
              tags, d.get('price_range',''), d.get('is_active','on') == 'on', store_id))
        conn.commit(); cur.close(); release_db(conn)
        return redirect(f"/admin/store/{store_id}/hours")
    else:
        token = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO stores (name, category, address, phone, instagram,
                description, menu_image_url, menu_tags, price_range, admin_token)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
        """, (d['name'], d.get('category',''), d.get('address',''), d.get('phone',''),
              d.get('instagram',''), d.get('description',''), d.get('menu_image_url',''),
              tags, d.get('price_range',''), token))
        store_id = cur.fetchone()['id']
        conn.commit(); cur.close(); release_db(conn)
        return redirect(f"/admin/store/{store_id}/hours")

@app.route("/admin/store/<int:store_id>/hours", methods=["GET", "POST"])
def admin_store_hours(store_id):
    if not session.get("admin"): return redirect(url_for("admin"))
    conn = get_db(); cur = conn.cursor()
    if request.method == "POST":
        cur.execute("DELETE FROM store_hours WHERE store_id=%s", (store_id,))
        days = ['sun','mon','tue','wed','thu','fri','sat']
        for i, day in enumerate(days):
            cur.execute("""
                INSERT INTO store_hours
                    (store_id, day_of_week, open_time, close_time, break_start, break_end, is_day_off)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, (store_id, i,
                  request.form.get(f"{day}_open",""),
                  request.form.get(f"{day}_close",""),
                  request.form.get(f"{day}_break_start",""),
                  request.form.get(f"{day}_break_end",""),
                  request.form.get(f"{day}_off") == "on"))
        conn.commit(); cur.close(); release_db(conn)
        return redirect(url_for("admin_dashboard"))
    cur.execute("SELECT * FROM stores WHERE id=%s", (store_id,))
    store = dict(cur.fetchone())
    cur.execute("SELECT * FROM store_hours WHERE store_id=%s ORDER BY day_of_week", (store_id,))
    hours = {r['day_of_week']: dict(r) for r in cur.fetchall()}
    cur.close(); release_db(conn)
    return render_template("admin.html", login_mode=False, hours_mode=True,
                           store=store, hours=hours)

@app.route("/admin/store/<int:store_id>/delete", methods=["POST"])
def admin_store_delete(store_id):
    if not session.get("admin"): return redirect(url_for("admin"))
    conn = get_db(); cur = conn.cursor()
    cur.execute("UPDATE stores SET is_active=FALSE WHERE id=%s", (store_id,))
    conn.commit(); cur.close(); release_db(conn)
    return redirect(url_for("admin_dashboard"))

@app.route("/admin/store/<int:store_id>/token")
def admin_store_token(store_id):
    if not session.get("admin"): return jsonify({"error": "unauthorized"}), 401
    conn = get_db(); cur = conn.cursor()
    cur.execute("SELECT name, admin_token FROM stores WHERE id=%s", (store_id,))
    row = cur.fetchone()
    cur.close(); release_db(conn)
    if not row: return jsonify({}), 404
    base = request.host_url.rstrip('/')
    return jsonify({"name": row['name'], "url": f"{base}/manage/{row['admin_token']}"})

# ── Start ─────────────────────────────────────────────────────────────────────
ensure_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
