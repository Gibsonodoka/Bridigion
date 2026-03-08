import { Response, NextFunction } from 'express';
import { AdminRequest } from '../middlewares/adminAuth.middleware';
import {
  loginAdmin,
  getStats,
  getPendingVerifications,
  getUserById,
  updateVerificationStatus,
  getAllUsers,
} from '../services/admin.service';
import {
  notifyVerificationUpdate,
  notifyCompanyStatusUpdate,
} from '../services/notification.service';

export const loginHandler = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ status: 'error', message: 'Email and password are required.' });
      return;
    }

    const result = await loginAdmin(email, password);

    if (!result.success) {
      res.status(401).json({ status: 'error', message: result.message });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: { token: result.token, admin: result.admin },
    });
  } catch (error) {
    next(error);
  }
};

export const getStatsHandler = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await getStats();
    res.status(200).json({ status: 'success', data: stats });
  } catch (error) {
    next(error);
  }
};

export const getVerificationsHandler = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await getPendingVerifications(page, limit);

    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: { total: result.total, page, limit },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserHandler = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await getUserById(id);

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found.' });
      return;
    }

    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};

export const approveUserHandler = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const adminId = req.admin!.id;

    const success = await updateVerificationStatus(id, 'verified', adminId, reason);
    await notifyVerificationUpdate(id, 'verified', reason);

    if (!success) {
      res.status(500).json({ status: 'error', message: 'Failed to approve user.' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'User approved successfully.' });
  } catch (error) {
    next(error);
  }
};

export const rejectUserHandler = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const adminId = req.admin!.id;

    if (!reason) {
      res.status(400).json({ status: 'error', message: 'Rejection reason is required.' });
      return;
    }

    const success = await updateVerificationStatus(id, 'rejected', adminId, reason);
    await notifyVerificationUpdate(id, 'rejected', reason);

    if (!success) {
      res.status(500).json({ status: 'error', message: 'Failed to reject user.' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'User rejected successfully.' });
  } catch (error) {
    next(error);
  }
};

export const flagUserHandler = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const adminId = req.admin!.id;

    const success = await updateVerificationStatus(id, 'flagged', adminId, reason);
    await notifyVerificationUpdate(id, 'flagged', reason);

    if (!success) {
      res.status(500).json({ status: 'error', message: 'Failed to flag user.' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'User flagged for review.' });
  } catch (error) {
    next(error);
  }
};

export const getUsersHandler = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string | undefined;
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await getAllUsers(page, limit, status, role, search);

    res.status(200).json({
      status: 'success',
      data: result.data,
      meta: { total: result.total, page, limit },
    });
  } catch (error) {
    next(error);
  }
};