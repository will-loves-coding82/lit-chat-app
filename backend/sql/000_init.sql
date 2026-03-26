CREATE SCHEMA lit_db;

CREATE TABLE IF NOT EXISTS lit_db.users (
  id         SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  email      TEXT NOT NULL,
  password   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lit_db.chats (
  id            SERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lit_db.members (
  id        SERIAL PRIMARY KEY,
  member_id INT NOT NULL,
  chat_id   INT NOT NULL,
  last_seen INT,
  CONSTRAINT fk_member_id FOREIGN KEY (member_id) REFERENCES lit_db.users(id),
  CONSTRAINT fk_chat_id   FOREIGN KEY (chat_id)   REFERENCES lit_db.chats(id)
);

CREATE TABLE IF NOT EXISTS lit_db.messages (
  id         SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content    TEXT        NOT NULL,
  sender_id  INT         NOT NULL,
  chat_id    INT         NOT NULL,
  CONSTRAINT fk_sender_id FOREIGN KEY (sender_id) REFERENCES lit_db.users(id),
  CONSTRAINT fk_chat_id   FOREIGN KEY (chat_id)   REFERENCES lit_db.chats(id)
);