CREATE TABLE IF NOT EXISTS guestbook (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '💖',
  message TEXT NOT NULL,
  ip_hash TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON guestbook(created_at DESC);
