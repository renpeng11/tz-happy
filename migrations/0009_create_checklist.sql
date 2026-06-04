CREATE TABLE IF NOT EXISTS checklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  user_id INTEGER,
  user_name TEXT,
  user_avatar TEXT,
  is_checked INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 插入一些默认的必备清单
INSERT INTO checklist (name) VALUES 
('身份证'),
('手机充电器'),
('充电宝'),
('防晒霜'),
('雨伞'),
('纸巾'),
('水'),
('零食'),
('帽子'),
('墨镜');
