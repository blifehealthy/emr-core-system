DROP TRIGGER IF EXISTS trg_practitioners_set_updated_at ON practitioners;
DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;

DROP TABLE IF EXISTS practitioners;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS app_user_role;
