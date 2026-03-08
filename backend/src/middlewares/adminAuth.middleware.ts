import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminTokenPayload } from '../services/admin.service';

export interface AdminRequest extends Request {
  admin?: AdminTokenPayload;
}

export const adminAuthMiddleware = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ status: 'error', message: 'Unauthorized. Token required.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AdminTokenPayload;
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ status: 'error', message: 'Unauthorized. Invalid or expired token.' });
  }
};

export const requireSuperAdmin = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.admin?.role !== 'super_admin') {
    res.status(403).json({ status: 'error', message: 'Forbidden. Super admin access required.' });
    return;
  }
  next();
};