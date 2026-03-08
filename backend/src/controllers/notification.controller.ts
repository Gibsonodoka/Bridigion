import { Response, NextFunction } from 'express';
import { UserRequest } from '../middlewares/userAuth.middleware';
import { CompanyRequest } from '../middlewares/companyAuth.middleware';
import { AdminRequest } from '../middlewares/adminAuth.middleware';
import {
  getNotifications,
  markAllRead,
  markOneRead,
} from '../services/notification.service';

export const getUserNotificationsHandler = async (
  req: UserRequest, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const result = await getNotifications('user', req.user!.id, page);
    res.status(200).json({ status: 'success', ...result });
  } catch (error) { next(error); }
};

export const getCompanyNotificationsHandler = async (
  req: CompanyRequest, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const result = await getNotifications('company', req.company!.id, page);
    res.status(200).json({ status: 'success', ...result });
  } catch (error) { next(error); }
};

export const getAdminNotificationsHandler = async (
  req: AdminRequest, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const result = await getNotifications('admin', req.admin!.id, page);
    res.status(200).json({ status: 'success', ...result });
  } catch (error) { next(error); }
};

export const markAllReadHandler = async (
  req: UserRequest & CompanyRequest & AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const path = req.path;
    if (path.includes('admin')) {
      await markAllRead('admin', (req as AdminRequest).admin!.id);
    } else if (path.includes('company')) {
      await markAllRead('company', (req as CompanyRequest).company!.id);
    } else {
      await markAllRead('user', (req as UserRequest).user!.id);
    }
    res.status(200).json({ status: 'success', message: 'All marked as read.' });
  } catch (error) { next(error); }
};

export const markOneReadHandler = async (
  req: UserRequest, res: Response, next: NextFunction
): Promise<void> => {
  try {
    await markOneRead(req.params.id as string);
    res.status(200).json({ status: 'success', message: 'Marked as read.' });
  } catch (error) { next(error); }
};