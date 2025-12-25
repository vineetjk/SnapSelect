import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  photographerId?: number;
}

export const authenticatePhotographer = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      photographerId: number;
    };

    req.photographerId = decoded.photographerId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
