import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ 

    path: path.resolve(__dirname, '../integration/.env.test') 
});