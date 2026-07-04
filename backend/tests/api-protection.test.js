import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('protected API modules', () => {
  const protectedRequests = [
    ['GET', '/api/v1/organizations'],
    ['POST', '/api/v1/organizations'],
    ['GET', '/api/v1/projects'],
    ['POST', '/api/v1/projects'],
    ['GET', '/api/v1/queues'],
    ['POST', '/api/v1/queues'],
    ['GET', '/api/v1/retry-policies'],
    ['POST', '/api/v1/retry-policies'],
    ['GET', '/api/v1/jobs'],
    ['POST', '/api/v1/jobs'],
    ['POST', '/api/v1/jobs/batch'],
    ['GET', '/api/v1/workers'],
    ['POST', '/api/v1/workers/claim'],
    ['GET', '/api/v1/dead-letter-jobs'],
    ['GET', '/api/v1/logs/job-logs'],
    ['GET', '/api/v1/logs/worker-logs'],
    ['GET', '/api/v1/logs/executions']
  ];

  it.each(protectedRequests)('%s %s requires authentication', async (method, path) => {
    const response = await request(app)[method.toLowerCase()](path).send({});
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
