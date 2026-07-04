import { calculateRetryDelay } from '../src/services/retryPolicy.service.js';

describe('retry delay strategies', () => {
  it('calculates fixed retry delay', () => {
    const delay = calculateRetryDelay({ strategy: 'FIXED', baseDelaySeconds: 10, maxDelaySeconds: 100, jitterEnabled: false }, 4);
    expect(delay).toBe(10);
  });

  it('calculates linear backoff delay', () => {
    const delay = calculateRetryDelay({ strategy: 'LINEAR', baseDelaySeconds: 10, maxDelaySeconds: 100, jitterEnabled: false }, 4);
    expect(delay).toBe(40);
  });

  it('calculates exponential backoff delay and caps at max delay', () => {
    const delay = calculateRetryDelay({ strategy: 'EXPONENTIAL', baseDelaySeconds: 10, maxDelaySeconds: 60, jitterEnabled: false }, 4);
    expect(delay).toBe(60);
  });
});
