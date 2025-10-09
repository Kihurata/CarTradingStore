import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import userRoutes from './routes/userRoutes';
import listingRoutes from './routes/listingRoutes';  
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import pool from './config/database';

const app: Application = express();

// Thêm cookieParser
app.use(cookieParser());

// CORS cho frontend (local + Docker)
app.use(cors({
  origin: ['http://localhost:3000', 'http://backend:4000'],  // Local + Docker
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes); 

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ status: 'OK', message: 'Backend Autorizz running!', db_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err instanceof Error ? err.message : String(err) });
  }
});

export default app;