import axios from 'axios';

const MSG91_API_KEY = process.env.MSG91_API_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'HOMEHP';
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSMS(phoneNumber: string, otp: string): Promise<SMSResult> {
  // Format phone number for India (+91XXXXXXXXXX)
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;
  
  if (!MSG91_API_KEY || !MSG91_TEMPLATE_ID) {
    console.warn('[SMS] MSG91 credentials not configured, falling back to console log');
    console.log(`[OTP SMS] ${phoneNumber} -> ${otp}`);
    return { success: true, messageId: 'dev-mode' };
  }

  try {
    const response = await axios.post(
      'https://api.msg91.com/api/v5/otp/send',
      {
        template_id: MSG91_TEMPLATE_ID,
        mobile: formattedPhone,
        authkey: MSG91_API_KEY,
        otp: otp,
        otp_length: 4,
        sender: MSG91_SENDER_ID,
        var1: otp,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'authkey': MSG91_API_KEY,
        },
      }
    );

    if (response.data.type === 'success') {
      return { success: true, messageId: response.data.message };
    } else {
      console.error('[SMS] MSG91 error:', response.data);
      return { success: false, error: response.data.message || 'Failed to send SMS' };
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    console.error('[SMS] Failed to send SMS:', axiosError.response?.data || axiosError.message);
    return { success: false, error: axiosError.response?.data?.message || 'Failed to send SMS' };
  }
}

export async function verifySMS(phoneNumber: string, otp: string): Promise<SMSResult> {
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;

  if (!MSG91_API_KEY || !MSG91_TEMPLATE_ID) {
    console.warn('[SMS] MSG91 credentials not configured, cannot verify via MSG91');
    return { success: false, error: 'SMS provider not configured' };
  }

  try {
    const response = await axios.post(
      'https://api.msg91.com/api/v5/otp/verify',
      {
        template_id: MSG91_TEMPLATE_ID,
        mobile: formattedPhone,
        authkey: MSG91_API_KEY,
        otp: otp,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'authkey': MSG91_API_KEY,
        },
      }
    );

    if (response.data.type === 'success') {
      return { success: true, messageId: response.data.message };
    } else {
      console.error('[SMS] MSG91 verify error:', response.data);
      return { success: false, error: response.data.message || 'Invalid OTP' };
    }
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    console.error('[SMS] Failed to verify OTP:', axiosError.response?.data || axiosError.message);
    return { success: false, error: axiosError.response?.data?.message || 'Failed to verify OTP' };
  }
}