import { Router } from 'express';

export const bookingsRouter = Router();

bookingsRouter.get('/', (_req, res) => {
  res.json({ bookings: [] });
});

bookingsRouter.post('/', (_req, res) => {
  res.json({ message: 'Booking created', id: 'placeholder' });
});

bookingsRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id, status: 'pending' });
});

bookingsRouter.patch('/:id/cancel', (req, res) => {
  res.json({ id: req.params.id, status: 'cancelled' });
});
