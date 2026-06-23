import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/send-otp', (_req, res) => {
  res.json({ message: 'OTP sent' });
});

authRouter.post('/verify-otp', (_req, res) => {
  res.json({ message: 'OTP verified', token: 'placeholder' });
});
