import dotenv from 'dotenv';
import { initializeDatabase } from './database';

dotenv.config();

initializeDatabase()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });
