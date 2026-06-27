import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { JWT_SECRET } from '../lib/constants';
import { validatePhoneNumber } from '../middleware/validation';

const OTP_TTL_SECONDS = 300;

export const authRouter = Router();

function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

authRouter.post('/send-otp', async (req, res) => {
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
  } catch {
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

authRouter.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'phoneNumber and otp are required' });
    }

    const redisKey = `otp:${phoneNumber}`;
    const storedOtp = await redis.get(redisKey);

    if (storedOtp === null || storedOtp === undefined || String(storedOtp) !== String(otp)) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    await redis.del(redisKey);

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

    return res.json({ message: 'OTP verified', token, user });
  } catch {
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

authRouter.get('/me', async (req, res) => {
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
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

authRouter.post('/logout', async (_req, res) => {
  return res.json({ message: 'Logged out successfully' });
});
