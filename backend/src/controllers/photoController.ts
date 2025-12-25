import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { getDb } from '../utils/database';
import { AuthRequest } from '../middleware/auth';
import { addWatermarkAndResize } from '../utils/watermark';

export const uploadPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clientId } = req.body;
    const photographerId = req.photographerId;
    const files = req.files as Express.Multer.File[];

    if (!clientId || !files || files.length === 0) {
      res.status(400).json({ error: 'Client ID and photos are required' });
      return;
    }

    const db = await getDb();

    // Verify client belongs to photographer
    const client = await db.get(
      'SELECT id FROM clients WHERE id = ? AND photographer_id = ?',
      clientId,
      photographerId
    );

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    // Insert photos
    const photos = [];
    for (const file of files) {
      const result = await db.run(
        `INSERT INTO photos (client_id, photographer_id, filename, original_filename, file_path)
         VALUES (?, ?, ?, ?, ?)`,
        clientId,
        photographerId,
        file.filename,
        file.originalname,
        file.path
      );

      photos.push({
        id: result.lastID,
        filename: file.filename,
        originalFilename: file.originalname
      });
    }

    res.status(201).json({ photos, count: photos.length });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
};

export const getPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const photographerId = req.photographerId;
    const db = await getDb();

    // Verify ownership
    const client = await db.get(
      'SELECT id FROM clients WHERE id = ? AND photographer_id = ?',
      clientId,
      photographerId
    );

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const photos = await db.all(
      `SELECT p.*,
        COUNT(f.id) as like_count
       FROM photos p
       LEFT JOIN favorites f ON p.id = f.photo_id
       WHERE p.client_id = ?
       GROUP BY p.id
       ORDER BY p.uploaded_at DESC`,
      clientId
    );

    res.json(photos);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
};

export const getPhotosByLink = async (req: Request<{ uniqueLink: string }>, res: Response): Promise<void> => {
  try {
    const { uniqueLink } = req.params;
    const db = await getDb();

    const client = await db.get(
      'SELECT id FROM clients WHERE unique_link = ?',
      uniqueLink
    );

    if (!client) {
      res.status(404).json({ error: 'Gallery not found' });
      return;
    }

    const photos = await db.all(
      `SELECT p.*,
        EXISTS(SELECT 1 FROM favorites WHERE photo_id = p.id AND client_id = ?) as is_favorite,
        COUNT(f.id) as like_count
       FROM photos p
       LEFT JOIN favorites f ON p.id = f.photo_id
       WHERE p.client_id = ?
       GROUP BY p.id
       ORDER BY p.uploaded_at DESC`,
      client.id,
      client.id
    );

    res.json(photos);
  } catch (error) {
    console.error('Get photos by link error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
};

export const togglePhotoSelection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    const photographerId = req.photographerId;
    const db = await getDb();

    // Verify ownership
    const photo = await db.get(
      'SELECT id, is_selected FROM photos WHERE id = ? AND photographer_id = ?',
      photoId,
      photographerId
    );

    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    const newSelection = photo.is_selected ? 0 : 1;
    await db.run(
      'UPDATE photos SET is_selected = ? WHERE id = ?',
      newSelection,
      photoId
    );

    res.json({ isSelected: newSelection === 1 });
  } catch (error) {
    console.error('Toggle selection error:', error);
    res.status(500).json({ error: 'Failed to toggle selection' });
  }
};

export const downloadPhoto = async (req: Request<{ photoId: string }, any, any, { quality?: string }>, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    const { quality } = req.query;
    const db = await getDb();

    const photo = await db.get(
      `SELECT p.*, c.unique_link, ph.studio_name
       FROM photos p
       JOIN clients c ON p.client_id = c.id
       JOIN photographers ph ON p.photographer_id = ph.id
       WHERE p.id = ?`,
      photoId
    );

    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    const qualityLevel = (quality as string) || 'medium';
    if (!['low', 'medium', 'high', 'original'].includes(qualityLevel)) {
      res.status(400).json({ error: 'Invalid quality parameter' });
      return;
    }

    // Create temp directory for watermarked images
    const tempDir = path.join(process.env.UPLOAD_DIR || './uploads', 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    const outputFilename = `${path.parse(photo.filename).name}_${qualityLevel}.jpg`;
    const outputPath = path.join(tempDir, outputFilename);

    // Add watermark and resize
    await addWatermarkAndResize(photo.file_path, outputPath, {
      quality: qualityLevel as any,
      studioName: photo.studio_name
    });

    // Send file
    res.download(outputPath, outputFilename, async (err) => {
      // Clean up temp file after download
      try {
        await fs.unlink(outputPath);
      } catch (e) {
        console.error('Failed to delete temp file:', e);
      }
    });
  } catch (error) {
    console.error('Download photo error:', error);
    res.status(500).json({ error: 'Failed to download photo' });
  }
};

export const deletePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { photoId } = req.params;
    const photographerId = req.photographerId;
    const db = await getDb();

    const photo = await db.get(
      'SELECT id, file_path FROM photos WHERE id = ? AND photographer_id = ?',
      photoId,
      photographerId
    );

    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    // Delete file
    try {
      await fs.unlink(photo.file_path);
    } catch (e) {
      console.error('Failed to delete file:', e);
    }

    // Delete from database
    await db.run('DELETE FROM photos WHERE id = ?', photoId);

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};
