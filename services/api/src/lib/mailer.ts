import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'HomeHelp <noreply@homehelp.ai>';

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!client) client = new Resend(RESEND_API_KEY);
  return client;
}

export async function sendOtpEmail(
  to: string,
  bookingId: string,
  type: 'start' | 'end',
  otp: string,
): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.warn('[mailer] RESEND_API_KEY not set — skipping OTP email');
    return;
  }
  const label = type === 'start' ? 'start' : 'complete';
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Your HomeHelp ${label} OTP`,
      text:
        `Your OTP for booking ${bookingId} is ${otp}. ` +
        `Share this code with your worker to ${label} the job. ` +
        `It is valid for this booking only.`,
    });
  } catch (err) {
    console.error('[mailer] failed to send OTP email:', err);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.warn('[mailer] RESEND_API_KEY not set — skipping password reset email');
    return;
  }
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Reset your HomeHelp password',
      text:
        `We received a request to reset your HomeHelp password.\n\n` +
        `Reset your password here: ${resetUrl}\n\n` +
        `This link expires in 1 hour. If you did not request this, you can ignore this email.`,
    });
  } catch (err) {
    console.error('[mailer] failed to send password reset email:', err);
  }
}
