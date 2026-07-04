import { swaggerSpec } from '../src/docs/swagger.js';

describe('swagger documentation', () => {
  it('documents the main Phase 2 API groups', () => {
    const paths = Object.keys(swaggerSpec.paths);
    expect(paths).toContain('/api/v1/auth/login');
    expect(paths).toContain('/api/v1/organizations');
    expect(paths).toContain('/api/v1/projects');
    expect(paths).toContain('/api/v1/queues');
    expect(paths).toContain('/api/v1/jobs');
    expect(paths).toContain('/api/v1/workers/claim');
    expect(paths).toContain('/api/v1/dead-letter-jobs');
    expect(paths).toContain('/api/v1/logs/executions');
  });
});
