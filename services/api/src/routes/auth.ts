import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { JWT_SECRET } from '../lib/constants';
import { validateEmail, validatePhoneNumber } from '../middleware/validation';
import { sendPasswordResetEmail } from '../lib/mailer';
import bcrypt from 'bcryptjs';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://homehelp-website.vercel.app';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const isProduction = process.env.NODE_ENV === 'production';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phoneNumber } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phoneNumber,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.json({ message: 'User registered successfully', token, user: userWithoutPassword });
  } catch (err) {
    console.error('[auth] register error:', err);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (err) {
    console.error('[auth] login error:', err);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

authRouter.get('/me', async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (err) {
    console.error('[auth] me error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
});

authRouter.post('/logout', async (_req: Request, res: Response) => {
  res.clearCookie('auth_token');
  return res.json({ message: 'Logged out successfully' });
});

authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return the same generic response to avoid leaking account existence.
    const generic = { message: 'If an account exists for that email, a reset link has been sent.' };

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: hashToken(token), passwordResetExpires: expires },
      });

      const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      await sendPasswordResetEmail(email, resetUrl);

      if (!isProduction) {
        console.log(`[auth] password reset link for ${email}: ${resetUrl}`);
        return res.json({ ...generic, devResetUrl: resetUrl });
      }
    }

    return res.json(generic);
  } catch (err) {
    console.error('[auth] forgot-password error:', err);
    return res.status(500).json({ error: 'Failed to process request' });
  }
});

authRouter.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashToken(token),
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return res.json({ message: 'Password has been reset. You can now sign in.' });
  } catch (err) {
    console.error('[auth] reset-password error:', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});
