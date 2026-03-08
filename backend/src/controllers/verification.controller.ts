import { Request, Response, NextFunction } from 'express';
import { verifyNin, saveNinVerification, getUserByPhone } from '../services/nin.service';
import { supabaseAdmin } from '../config/supabase';

export const verifyNinHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nin, phone } = req.body;

    if (!nin || !phone) {
      res.status(400).json({ status: 'error', message: 'NIN and phone are required.' });
      return;
    }

    const user = await getUserByPhone(phone);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found.' });
      return;
    }

    const { data: existingVerification } = await supabaseAdmin
      .from('identity_verifications')
      .select('nin_attempts')
      .eq('user_id', user.id)
      .single();

    const currentAttempts = existingVerification?.nin_attempts || 0;

    if (currentAttempts >= 3) {
      res.status(400).json({
        status: 'error',
        message: 'Maximum NIN verification attempts reached. Your case has been flagged for manual review.',
      });
      return;
    }

    const result = await verifyNin(nin);
    const newAttempts = currentAttempts + 1;

    await saveNinVerification(user.id, nin, result.valid, newAttempts);

    if (!result.valid) {
      const remaining = 3 - newAttempts;
      res.status(400).json({
        status: 'error',
        message: remaining > 0
          ? `${result.message} ${remaining} attempt(s) remaining.`
          : 'Maximum attempts reached. Your case has been flagged for manual review.',
        data: { attempts: newAttempts, remaining },
      });
      return;
    }

    await supabaseAdmin
      .from('users')
      .update({ verification_status: 'pending' })
      .eq('id', user.id);

    res.status(200).json({
      status: 'success',
      message: 'NIN verified successfully.',
      data: { verified: true, userId: user.id },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadSelfieHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, imageData } = req.body;

    if (!phone || !imageData) {
      res.status(400).json({ status: 'error', message: 'Phone and image data are required.' });
      return;
    }

    const user = await getUserByPhone(phone);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found.' });
      return;
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `${user.id}-${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('selfies')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Selfie upload error:', uploadError.message);
      res.status(500).json({ status: 'error', message: 'Failed to upload selfie.' });
      return;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('selfies')
      .getPublicUrl(fileName);

    const selfieUrl = urlData.publicUrl;

    // Save URL to identity_verifications
    const { error: updateError } = await supabaseAdmin
      .from('identity_verifications')
      .update({ selfie_url: selfieUrl })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('❌ Save selfie URL error:', updateError.message);
      res.status(500).json({ status: 'error', message: 'Failed to save selfie URL.' });
      return;
    }

    console.log(`📸 Selfie uploaded for ${phone}: ${selfieUrl}`);

    res.status(200).json({
      status: 'success',
      message: 'Selfie uploaded successfully.',
      data: { selfieUrl },
    });
  } catch (error) {
    next(error);
  }
};

export const submitDocumentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ status: 'error', message: 'Phone is required.' });
      return;
    }

    const user = await getUserByPhone(phone);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found.' });
      return;
    }

    await supabaseAdmin
      .from('users')
      .update({ verification_status: 'pending' })
      .eq('id', user.id);

    res.status(200).json({
      status: 'success',
      message: 'Documents submitted for review. You will be notified.',
      data: { userId: user.id },
    });
  } catch (error) {
    next(error);
  }
};