import { Response, NextFunction } from 'express';
import { UserRequest } from '../middlewares/userAuth.middleware';
import {
  getUserById,
  getUserByPhone,
  issueUserToken,
  updateUserProfile,
  getVerificationProgress,
} from '../services/user.service';
import { sendOtp, verifyOtpCode } from '../services/otp.service';

// Step 1: Send OTP for login
export const loginSendOtpHandler = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ status: 'error', message: 'Phone number is required.' });
      return;
    }

    // Check user exists
    const user = await getUserByPhone(phone);
    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'No account found with this phone number. Please register first.',
      });
      return;
    }

    const result = await sendOtp(phone);

    if (!result.success) {
      res.status(400).json({ status: 'error', message: result.message });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: { phone },
    });
  } catch (error) {
    next(error);
  }
};

// Step 2: Verify OTP and issue JWT
export const loginVerifyOtpHandler = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({ status: 'error', message: 'Phone and OTP are required.' });
      return;
    }

    const result = await verifyOtpCode(phone, otp);

    if (!result.valid) {
      res.status(400).json({ status: 'error', message: result.message });
      return;
    }

    const user = await getUserByPhone(phone);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found.' });
      return;
    }

    const token = issueUserToken(user.id, user.phone);

    res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          verification_status: user.verification_status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /user/profile
export const getProfileHandler = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found.' });
      return;
    }

    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /user/profile
export const updateProfileHandler = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { full_name, email, date_of_birth } = req.body;

    const updated = await updateUserProfile(userId, { full_name, email, date_of_birth });

    if (!updated) {
      res.status(500).json({ status: 'error', message: 'Failed to update profile.' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// GET /user/status
export const getStatusHandler = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const progress = await getVerificationProgress(userId);

    if (!progress) {
      res.status(404).json({ status: 'error', message: 'User not found.' });
      return;
    }

    res.status(200).json({ status: 'success', data: progress });
  } catch (error) {
    next(error);
  }
};