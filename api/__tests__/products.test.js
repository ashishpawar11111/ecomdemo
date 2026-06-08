const request = require(class="tok-string">'supertest');
 
class=class="tok-string">"tok-comment">// Mock pg Pool before requiring app
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
 
describe(class="tok-string">'POST /api/products/order', () => {
  let mockClient;
 
  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    mockPool.connect.mockResolvedValue(mockClient);
  });
 
  afterEach(() => jest.clearAllMocks());
 
  it(class="tok-string">'should place an order and decrement stock', async () => {
    class=class="tok-string">"tok-comment">// BEGIN
    mockClient.query
      .mockResolvedValueOnce({}) class=class="tok-string">"tok-comment">// BEGIN
      .mockResolvedValueOnce({   class=class="tok-string">"tok-comment">// SELECT FOR UPDATE
        rows: [{ id: 1, name: class="tok-string">'Widget', price: 10.00, stock: 50 }],
      })
      .mockResolvedValueOnce({}) class=class="tok-string">"tok-comment">// UPDATE stock
      .mockResolvedValueOnce({   class=class="tok-string">"tok-comment">// INSERT order
        rows: [{ id: 1, product_id: 1, quantity: 2, total: 20.00, status: class="tok-string">'confirmed' }],
      })
      .mockResolvedValueOnce({}); class=class="tok-string">"tok-comment">// COMMIT
 
    const res = await request(app)
      .post(class="tok-string">'/api/products/order')
      .send({ productId: 1, quantity: 2 });
 
    expect(res.status).toBe(201);
    expect(res.body.order.total).toBe(20.00);
    expect(mockClient.query).toHaveBeenCalledTimes(5);
  });
 
  it(class="tok-string">'should return 409 when stock is insufficient', async () => {
    mockClient.query
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        rows: [{ id: 1, name: class="tok-string">'Widget', price: 10.00, stock: 1 }],
      })
      .mockResolvedValueOnce({}); class=class="tok-string">"tok-comment">// ROLLBACK
 
    const res = await request(app)
      .post(class="tok-string">'/api/products/order')
      .send({ productId: 1, quantity: 5 });
 
    expect(res.status).toBe(409);
    expect(res.body.error).toBe(class="tok-string">'Insufficient stock');
  });
});
