import express from 'express';
import { authenticatePhotographer } from '../middleware/auth';
import {
  createClient,
  getClients,
  getClientByLink,
  deleteClient
} from '../controllers/clientController';

const router = express.Router();

// Protected routes (photographer only)
router.post('/', authenticatePhotographer, createClient);
router.get('/', authenticatePhotographer, getClients);
router.delete('/:id', authenticatePhotographer, deleteClient);

// Public route (accessed via unique link)
router.get('/gallery/:uniqueLink', getClientByLink);

export default router;
