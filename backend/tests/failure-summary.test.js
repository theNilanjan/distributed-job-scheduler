import { buildFailureSummary } from '../src/utils/failureSummary.js';

describe('failure summary generation', () => {
  it('creates a concise summary for timeout failures', () => {
    const summary = buildFailureSummary({
      queueName: 'billing',
      jobName: 'invoice-sync',
      errorMessage: 'Execution timed out after 30 seconds',
      attempts: 3
    });

    expect(summary).toContain('billing');
    expect(summary).toContain('invoice-sync');
    expect(summary).toContain('timed out');
    expect(summary).toContain('3 attempts');
  });
});
