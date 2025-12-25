import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../utils/database';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, studioName } = req.body;

    if (!email || !password || !studioName) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const db = await getDb();

    // Check if photographer already exists
    const existing = await db.get('SELECT id FROM photographers WHERE email = ?', email);
    if (existing) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create photographer
    const result = await db.run(
      'INSERT INTO photographers (email, password, studio_name) VALUES (?, ?, ?)',
      email,
      hashedPassword,
      studioName
    );

    // Generate JWT
    const token = jwt.sign(
      { photographerId: result.lastID },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      photographer: {
        id: result.lastID,
        email,
        studioName
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const db = await getDb();

    // Find photographer
    const photographer = await db.get(
      'SELECT * FROM photographers WHERE email = ?',
      email
    );

    if (!photographer) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, photographer.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { photographerId: photographer.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      photographer: {
        id: photographer.id,
        email: photographer.email,
        studioName: photographer.studio_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};
