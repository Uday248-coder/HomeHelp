import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { JWT_SECRET } from '../lib/constants';
import { validatePhoneNumber } from '../middleware/validation';
import { getFirebaseAuth } from '../lib/firebase';

const OTP_TTL_SECONDS = 300;
const isProduction = process.env.NODE_ENV === 'production';

export const authRouter = Router();

function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

authRouter.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }
    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const attemptKey = `otp_attempts:${phoneNumber}`;
    const attempts = await redis.get(attemptKey);
    if (attempts && Number(attempts) >= 5) {
      return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    }

    const otp = generateOtp();
    const redisKey = `otp:${phoneNumber}`;

    await redis.set(redisKey, otp, { ex: OTP_TTL_SECONDS });

    const newCount = await redis.incr(attemptKey);
    if (newCount <= 1) {
      await redis.expire(attemptKey, 900);
    }

    console.log(`[OTP] ${phoneNumber} -> ${otp}`);

    return res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('[auth] send-otp error:', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

authRouter.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'phoneNumber and otp are required' });
    }

    const attemptKey = `otp_verify_attempts:${phoneNumber}`;
    const attempts = await redis.get(attemptKey);
    if (attempts && Number(attempts) >= 5) {
      return res.status(429).json({ error: 'Too many failed attempts. Request a new OTP.' });
    }

    const redisKey = `otp:${phoneNumber}`;
    const storedOtp = await redis.get(redisKey);

    if (storedOtp === null || storedOtp === undefined || String(storedOtp) !== String(otp)) {
      const newCount = await redis.incr(attemptKey);
      if (newCount <= 1) {
        await redis.expire(attemptKey, 900);
      }
      if (newCount >= 5) {
        await redis.del(redisKey);
        await redis.del(attemptKey);
      }
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    await redis.del(redisKey);
    await redis.del(attemptKey);

    const user = await prisma.user.upsert({
      where: { phoneNumber },
      update: {},
      create: { phoneNumber },
    });

    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
    });

    return res.json({ message: 'OTP verified', token, user });
  } catch (err) {
    console.error('[auth] verify-otp error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

authRouter.get('/me', async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('[auth] me error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

authRouter.post('/logout', async (_req: Request, res: Response) => {
  res.clearCookie('auth_token');
  return res.json({ message: 'Logged out successfully' });
});

authRouter.post('/firebase', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    const decoded = await getFirebaseAuth().verifyIdToken(idToken);
    const phoneNumber = decoded.phone_number;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Firebase token does not contain a phone number' });
    }

    const user = await prisma.user.upsert({
      where: { phoneNumber },
      update: {},
      create: { phoneNumber },
    });

    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
    });

    return res.json({ message: 'Authenticated', token, user });
  } catch (err) {
    console.error('[auth] firebase error:', err);
    return res.status(401).json({ error: 'Invalid Firebase ID token' });
  }
});
