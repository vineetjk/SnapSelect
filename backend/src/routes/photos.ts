import express from 'express';
import { authenticatePhotographer } from '../middleware/auth';
import { upload } from '../utils/fileUpload';
import {
  uploadPhotos,
  getPhotos,
  getPhotosByLink,
  togglePhotoSelection,
  downloadPhoto,
  deletePhoto
} from '../controllers/photoController';

const router = express.Router();

// Protected routes (photographer only)
router.post('/upload', authenticatePhotographer, upload.array('photos', 100), uploadPhotos);
router.get('/client/:clientId', authenticatePhotographer, getPhotos);
router.patch('/:photoId/select', authenticatePhotographer, togglePhotoSelection);
router.delete('/:photoId', authenticatePhotographer, deletePhoto);

// Public routes
router.get('/gallery/:uniqueLink', getPhotosByLink);
router.get('/download/:photoId', downloadPhoto);

export default router;
