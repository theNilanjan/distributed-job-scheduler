import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('authentication API validation', () => {
  it('rejects invalid registration payloads before service execution', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({ email: 'bad', password: 'short' });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });

  it('rejects invalid login payloads before service execution', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({ email: 'admin@example.com', password: 'x' });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('requires a refresh token for refresh flow', async () => {
    const response = await request(app).post('/api/v1/auth/refresh').send({});
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
