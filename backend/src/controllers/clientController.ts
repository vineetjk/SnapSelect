import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../utils/database';
import { AuthRequest } from '../middleware/auth';

export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;
    const photographerId = req.photographerId;

    if (!name) {
      res.status(400).json({ error: 'Client name is required' });
      return;
    }

    const db = await getDb();

    // Generate unique link
    const uniqueLink = uuidv4();

    const result = await db.run(
      'INSERT INTO clients (photographer_id, name, email, unique_link) VALUES (?, ?, ?, ?)',
      photographerId,
      name,
      email || null,
      uniqueLink
    );

    res.status(201).json({
      id: result.lastID,
      name,
      email,
      uniqueLink,
      galleryUrl: `/gallery/${uniqueLink}`
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const photographerId = req.photographerId;
    const db = await getDb();

    const clients = await db.all(
      `SELECT c.*,
        COUNT(DISTINCT p.id) as photo_count,
        COUNT(DISTINCT CASE WHEN p.is_selected = 1 THEN p.id END) as selected_count
       FROM clients c
       LEFT JOIN photos p ON c.id = p.client_id
       WHERE c.photographer_id = ?
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      photographerId
    );

    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

export const getClientByLink = async (req: Request<{ uniqueLink: string }>, res: Response): Promise<void> => {
  try {
    const { uniqueLink } = req.params;
    const db = await getDb();

    const client = await db.get(
      `SELECT c.*, p.studio_name
       FROM clients c
       JOIN photographers p ON c.photographer_id = p.id
       WHERE c.unique_link = ?`,
      uniqueLink
    );

    if (!client) {
      res.status(404).json({ error: 'Gallery not found' });
      return;
    }

    res.json(client);
  } catch (error) {
    console.error('Get client by link error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const photographerId = req.photographerId;
    const db = await getDb();

    // Verify ownership
    const client = await db.get(
      'SELECT id FROM clients WHERE id = ? AND photographer_id = ?',
      id,
      photographerId
    );

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    await db.run('DELETE FROM clients WHERE id = ?', id);

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
};
