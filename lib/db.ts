import { Pool } from 'pg';

const pool = new Pool({
  host: "localhost",
  //user: "root",
  //password: process.env.PGPASSWORD,
  database: "jacksangster",
  port: 5432
});

export default pool;