import { Request, Response, NextFunction } from 'express';
import { sendOtp, verifyOtpCode } from '../services/otp.service';
import { supabaseAdmin } from '../config/supabase';

export const sendOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ status: 'error', message: 'Phone number is required' });
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

export const verifyOtpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({ status: 'error', message: 'Phone and OTP are required' });
      return;
    }

    const result = await verifyOtpCode(phone, otp);

    if (!result.valid) {
      res.status(400).json({ status: 'error', message: result.message });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: { phone, verified: true },
    });
  } catch (error) {
    next(error);
  }
};

export const completeProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, dob, phone } = req.body;

    if (!name || !email || !dob || !phone) {
      res.status(400).json({ status: 'error', message: 'All fields are required' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        phone,
        email,
        full_name: name,
        date_of_birth: dob,
      }, { onConflict: 'phone' })
      .select()
      .single();

    if (error) {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile saved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const selectRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role, phone } = req.body;
    const validRoles = ['guard', 'driver', 'bouncer'];

    if (!role || !validRoles.includes(role.toLowerCase())) {
      res.status(400).json({
        status: 'error',
        message: 'Role must be one of: guard, driver, bouncer',
      });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role: role.toLowerCase() })
      .eq('phone', phone)
      .select()
      .single();

    if (error) {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Role selected successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};