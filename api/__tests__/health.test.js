const request = require(class="tok-string">'supertest');
 
jest.mock(class="tok-string">'pg', () => {
  const mockPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mockPool) };
});
 
const { Pool } = require(class="tok-string">'pg');
const mockPool = new Pool();
const app = require(class="tok-string">'../src/index');
 
describe(class="tok-string">'Health endpoints', () => {
  it(class="tok-string">'GET /health should return 200', async () => {
    const res = await request(app).get(class="tok-string">'/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(class="tok-string">'ok');
    expect(res.body).toHaveProperty(class="tok-string">'uptime');
  });
 
  it(class="tok-string">'GET /health/db should return 200 when DB is up', async () => {
    mockPool.query.mockResolvedValueOnce({
      rows: [{ now: class="tok-string">'2025-01-01T00:00:00Z' }],
    });
 
    const res = await request(app).get(class="tok-string">'/health/db');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(class="tok-string">'ok');
  });
 
  it(class="tok-string">'GET /health/db should return 503 when DB is down', async () => {
    mockPool.query.mockRejectedValueOnce(new Error(class="tok-string">'Connection refused'));
 
    const res = await request(app).get(class="tok-string">'/health/db');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe(class="tok-string">'error');
  });
});
