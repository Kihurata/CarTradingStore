import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();  // Load .env chính
if (process.env.NODE_ENV !== 'production' && process.env.DB_HOST !== 'database') {
  dotenv.config({ path: '.env.local', override: true });  // Chỉ local, skip nếu Docker
}

console.log('DB Config loaded:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '***' : undefined,
  database: process.env.DB_NAME
});

const pool = new Pool({
  host: process.env.DB_HOST || 'database',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cartradingstore',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
});

// Retry connect với max 10 attempts
let retries = 0;
const maxRetries = 10;
const connectWithRetry = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ DB connected:', result.rows[0].now);
  } catch (err) {
    retries++;
    if (retries <= maxRetries) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log(`DB connect fail (attempt ${retries}/${maxRetries}):`, errorMessage);
      setTimeout(connectWithRetry, 2000 * retries);  // Backoff: 2s, 4s, etc.
    } else {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('❌ DB connect failed after max retries:', errorMessage);
      process.exit(1);  // Crash explicit để debug
    }
  }
};

// Export pool, gọi retry khi import (nhưng không block server start)
connectWithRetry();
export default pool;