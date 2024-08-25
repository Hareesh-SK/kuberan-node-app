import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'kuberan_postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'kuberan',
  password: process.env.DB_PASSWORD || 'kuberan_pw',
  port: parseInt(process.env.DB_PORT || '5332', 10),
});

export default pool;
