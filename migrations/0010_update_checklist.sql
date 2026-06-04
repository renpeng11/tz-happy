-- 创建用户勾选状态表
CREATE TABLE IF NOT EXISTS checklist_user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  checklist_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  is_checked INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (checklist_id) REFERENCES checklist(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_checklist_user_checklist ON checklist_user(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_user_user ON checklist_user(user_id);
