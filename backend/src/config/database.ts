import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

console.log('DB Config loaded:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '***' : undefined,
  database: process.env.DB_NAME
});

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cartradingstore',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
});

pool.query('SELECT NOW()').then(() => console.log('✅ DB connected')).catch((err) => console.error('DB connect fail:', err.message));

export default pool;