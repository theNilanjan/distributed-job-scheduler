import request from 'supertest';
import { createApp } from '../src/app.js';

describe('health route', () => {
  it('returns a structured response when route exists', async () => {
    const app = createApp();
    const response = await request(app).get('/api/v1/health');
    expect([200, 500]).toContain(response.status);
    expect(response.body).toHaveProperty('success');
  });
});
