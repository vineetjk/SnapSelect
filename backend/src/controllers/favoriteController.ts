import { Request, Response } from 'express';
import { getDb } from '../utils/database';

export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { photoId, uniqueLink } = req.body;

    if (!photoId || !uniqueLink) {
      res.status(400).json({ error: 'Photo ID and unique link are required' });
      return;
    }

    const db = await getDb();

    // Get client by unique link
    const client = await db.get(
      'SELECT id FROM clients WHERE unique_link = ?',
      uniqueLink
    );

    if (!client) {
      res.status(404).json({ error: 'Gallery not found' });
      return;
    }

    // Verify photo belongs to client
    const photo = await db.get(
      'SELECT id FROM photos WHERE id = ? AND client_id = ?',
      photoId,
      client.id
    );

    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    // Check if already favorited
    const existing = await db.get(
      'SELECT id FROM favorites WHERE photo_id = ? AND client_id = ?',
      photoId,
      client.id
    );

    if (existing) {
      // Remove favorite
      await db.run(
        'DELETE FROM favorites WHERE photo_id = ? AND client_id = ?',
        photoId,
        client.id
      );
      res.json({ isFavorite: false });
    } else {
      // Add favorite
      await db.run(
        'INSERT INTO favorites (photo_id, client_id) VALUES (?, ?)',
        photoId,
        client.id
      );
      res.json({ isFavorite: true });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
};

export const getFavorites = async (req: Request, res: Response): Promise<void> => {
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

    const favorites = await db.all(
      `SELECT p.*, f.created_at as favorited_at
       FROM favorites f
       JOIN photos p ON f.photo_id = p.id
       WHERE f.client_id = ?
       ORDER BY f.created_at DESC`,
      client.id
    );

    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
};
