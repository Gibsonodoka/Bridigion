import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TERMII_API_KEY = process.env.TERMII_API_KEY!;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'N-Alert';
const TERMII_BASE_URL = process.env.TERMII_BASE_URL || 'https://v3.api.termii.com';

export const sendSmsOtp = async (phone: string, otp: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${TERMII_BASE_URL}/api/sms/send`, {
      to: phone,
      from: TERMII_SENDER_ID,
      sms: `Your Bridigion verification code is ${otp}. Valid for 10 minutes. Do not share this code.`,
      type: 'plain',
      channel: 'generic',
      api_key: TERMII_API_KEY,
    });

    return response.data.code === 'ok';
  } catch (error) {
    console.error('Termii SMS error:', error);
    return false;
  }
};

export const sendEmailOtp = async (email: string, otp: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${TERMII_BASE_URL}/api/email/otp/send`, {
      api_key: TERMII_API_KEY,
      email_address: email,
      code: otp,
      email_configuration_id: process.env.TERMII_EMAIL_CONFIG_ID || '',
    });

    return response.data.code === 'ok';
  } catch (error) {
    console.error('Termii Email error:', error);
    return false;
  }
};