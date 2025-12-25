import express from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favoriteController';

const router = express.Router();

// Public routes (accessed via unique link)
router.post('/toggle', toggleFavorite);
router.get('/:uniqueLink', getFavorites);

export default router;
