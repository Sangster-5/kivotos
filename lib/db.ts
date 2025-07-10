import { Pool } from 'pg';

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "new_password",
  database: "jacksangster",
  port: 5432
});

export default pool;