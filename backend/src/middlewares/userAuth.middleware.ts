import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserTokenPayload } from '../services/user.service';

dotenv.config();

export interface UserRequest extends Request {
  user?: UserTokenPayload;
}

export const userAuthMiddleware = (
  req: UserRequest,
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
    const decoded = jwt.verify(token, process.env.USER_JWT_SECRET!) as UserTokenPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ status: 'error', message: 'Unauthorized. Invalid or expired token.' });
  }
};