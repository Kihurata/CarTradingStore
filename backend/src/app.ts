import express, { Application } from 'express';
import userRoutes from './routes/userRoutes';
import listingRoutes from './routes/listingRoutes';  
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes); 

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend Autorizz running!' });
});

export default app;