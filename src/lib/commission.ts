/**
 * Helpers for commission calculations in cents (integers).
 * Commission is applied as a percentage and rounding is done to nearest cent.
 */

export function calculateNetAmount(amountCts: number, commissionPercent = 5): number {
  if (!Number.isFinite(amountCts) || amountCts < 0) {
    throw new Error('Invalid amountCts');
  }
  if (!Number.isFinite(commissionPercent) || commissionPercent < 0 || commissionPercent >= 100) {
    throw new Error('Invalid commissionPercent');
  }

  // Compute net = round(amount * (100 - commissionPercent) / 100)
  // Use integer arithmetic to avoid floats: (amount * (100 - pct) + 50) / 100 rounds to nearest
  const numerator = amountCts * (100 - Math.round(commissionPercent));
  const net = Math.floor((numerator + 50) / 100);
  return net;
}
