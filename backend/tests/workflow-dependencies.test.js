import { shouldReleaseChildJob } from '../src/services/job.service.js';

describe('workflow dependency release rules', () => {
  it('releases a child job after a successful parent completion', () => {
    expect(shouldReleaseChildJob('COMPLETED', 'SUCCESS')).toBe(true);
    expect(shouldReleaseChildJob('FAILED', 'SUCCESS')).toBe(false);
    expect(shouldReleaseChildJob('DEAD_LETTER', 'SUCCESS')).toBe(false);
  });

  it('releases a child job once a parent reaches any terminal state for completion dependencies', () => {
    expect(shouldReleaseChildJob('COMPLETED', 'COMPLETION')).toBe(true);
    expect(shouldReleaseChildJob('FAILED', 'COMPLETION')).toBe(true);
    expect(shouldReleaseChildJob('DEAD_LETTER', 'COMPLETION')).toBe(true);
    expect(shouldReleaseChildJob('RUNNING', 'COMPLETION')).toBe(false);
  });
});
