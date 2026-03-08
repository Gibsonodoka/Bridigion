import { Request, Response, NextFunction } from 'express';
import { verifyCompanyToken } from '../services/marketplace.service';

export interface CompanyRequest extends Request {
  company?: { id: string; email: string };
}

export const companyAuthMiddleware = (
  req: CompanyRequest, res: Response, next: NextFunction
): void => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ status: 'error', message: 'Unauthorized.' });
    return;
  }
  const token = auth.split(' ')[1];
  const payload = verifyCompanyToken(token);
  if (!payload) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token.' });
    return;
  }
  req.company = { id: payload.id, email: payload.email };
  next();
};