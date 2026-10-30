import { describe, it, expect } from 'vitest';

function calculateSplit(amount: number) {
  const platformFee = parseFloat((amount * 0.15).toFixed(2));
  const workerPayout = parseFloat((amount * 0.85).toFixed(2));
  return { platformFee, workerPayout };
}

describe('Payment Fee Split', () => {
  it('₹1000 booking: platformFee=150, workerPayout=850', () => {
    const { platformFee, workerPayout } = calculateSplit(1000);
    expect(platformFee).toBe(150);
    expect(workerPayout).toBe(850);
  });

  it('₹199 booking: platformFee=29.85, workerPayout=169.15', () => {
    const { platformFee, workerPayout } = calculateSplit(199);
    expect(platformFee).toBe(29.85);
    expect(workerPayout).toBe(169.15);
  });

  it('₹0 booking: both should be 0', () => {
    const { platformFee, workerPayout } = calculateSplit(0);
    expect(platformFee).toBe(0);
    expect(workerPayout).toBe(0);
  });

  it('₹1 booking: platformFee=0.15, workerPayout=0.85', () => {
    const { platformFee, workerPayout } = calculateSplit(1);
    expect(platformFee).toBe(0.15);
    expect(workerPayout).toBe(0.85);
  });

  it('Large booking ₹50000: platformFee=7500, workerPayout=42500', () => {
    const { platformFee, workerPayout } = calculateSplit(50000);
    expect(platformFee).toBe(7500);
    expect(workerPayout).toBe(42500);
  });
});
