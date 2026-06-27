import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    if (res.statusCode >= 400) {
      console.error(`[ERROR] ${log}`);
    } else {
      console.log(`[REQ] ${log}`);
    }
  });
  next();
}

export function validatePhoneNumber(phoneNumber: string): boolean {
  return /^\+?[1-9]\d{9,14}$/.test(phoneNumber);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
