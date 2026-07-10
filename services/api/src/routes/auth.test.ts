import { describe, it, expect, beforeEach, vi } from 'vitest';
import crypto from 'crypto';
import express from 'express';
import request from 'supertest';
import { authRouter } from './auth';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('../lib/prisma', () => ({ prisma: prismaMock }));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(async (pw: string) => `hashed_${pw}`),
    compare: vi.fn(async (pw: string, hash: string) => hash === `hashed_${pw}`),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn((payload: unknown) => `token.${JSON.stringify(payload)}`),
    verify: vi.fn((token: string) => JSON.parse(token.split('.')[1])),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('auth routes', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset();
    prismaMock.user.create.mockReset();
    prismaMock.user.update.mockReset();
    prismaMock.user.findFirst.mockReset();
  });

  it('registers a new user and returns a JWT (no password in body)', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      name: 'A',
      phoneNumber: null,
      password: 'hashed_x',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'secret123', name: 'A' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('a@b.com');
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects duplicate email on register', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'secret123' });

    expect(res.status).toBe(400);
  });

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'secret123' });

    expect(res.status).toBe(400);
  });

  it('logs in with correct password', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      password: 'hashed_secret123',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects login with wrong password', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      password: 'hashed_other',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'secret123' });

    expect(res.status).toBe(401);
  });

  it('rejects login for unknown user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'x@y.com', password: 'secret123' });

    expect(res.status).toBe(401);
  });

  it('returns the user on /me with a Bearer token', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      name: 'A',
      phoneNumber: null,
      password: 'h',
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token.{"userId":"u1"}');

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe('u1');
  });

  it('rejects /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  describe('password reset', () => {
    const hashToken = (token: string) =>
      crypto.createHash('sha256').update(token).digest('hex');

    it('sends a reset link for an existing account (dev url in non-prod)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
      prismaMock.user.update.mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'a@b.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/reset link/i);
      expect(res.body.devResetUrl).toMatch(/token=/);
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: expect.objectContaining({ passwordResetToken: expect.any(String) }),
        }),
      );
    });

    it('returns a generic response for unknown email (no leak)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ghost@b.com' });

      expect(res.status).toBe(200);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('rejects forgot-password with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nope' });
      expect(res.status).toBe(400);
    });

    it('resets the password with a valid token and clears the token', async () => {
      const raw = 'raw-reset-token';
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'u1',
        passwordResetToken: hashToken(raw),
        passwordResetExpires: new Date(Date.now() + 60_000),
      });
      prismaMock.user.update.mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: raw, password: 'brandnew123' });

      expect(res.status).toBe(200);
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: expect.objectContaining({
            password: 'hashed_brandnew123',
            passwordResetToken: null,
            passwordResetExpires: null,
          }),
        }),
      );
    });

    it('rejects an expired or invalid reset token', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'wrong', password: 'brandnew123' });

      expect(res.status).toBe(400);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('rejects reset with a too-short password', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'x', password: '123' });
      expect(res.status).toBe(400);
      expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    });
  });
});
