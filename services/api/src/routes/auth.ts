import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'homehelp-dev-secret';
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

    const otp = generateOtp();
    const redisKey = `otp:${phoneNumber}`;

    await redis.set(redisKey, otp);
    await redis.expire(redisKey, OTP_TTL_SECONDS);

    console.log(`[OTP] ${phoneNumber} -> ${otp}`);

    return res.json({ message: 'OTP sent', otp });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('send-otp error:', msg);
    return res.status(500).json({ error: 'Failed to send OTP', detail: msg });
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

    let user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (!user) {
      user = await prisma.user.create({ data: { phoneNumber } });
    }

    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.json({ message: 'OTP verified', token, user });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('verify-otp error:', msg);
    return res.status(500).json({ error: 'Failed to verify OTP', detail: msg });
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
