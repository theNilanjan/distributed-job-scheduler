import crypto from 'crypto';

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function addDuration(date, duration) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return new Date(date.getTime() + amount * multipliers[unit]);
}
