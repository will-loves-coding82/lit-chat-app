-- ALTER TABLE lit_db.users ADD COLUMN users_search_vector tsvector GENERATED ALWAYS AS (
--   setweight(to_tsvector('english', coalesce(email, '')), 'A') ||
--   setweight(to_tsvector('english', coalesce(first_name, '')), 'B') ||
--   setweight(to_tsvector('english', coalesce(last_name, '')), 'C')
-- ) STORED;

-- CREATE INDEX users_search_idx ON lit_db.users USING GIN (users_search_vector);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX users_first_name_trgm_idx ON lit_db.users USING GIN (first_name gin_trgm_ops);
CREATE INDEX users_last_name_trgm_idx  ON lit_db.users USING GIN (last_name  gin_trgm_ops);
CREATE INDEX users_email_trgm_idx      ON lit_db.users USING GIN (email      gin_trgm_ops);
