import request from 'supertest';
import {app} from '../src/app'; 

describe('GET /', () => {
  it('should return 200 and a message', async () => {
    const response = await request(app).get('/api/example');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data', 'Hello, world!');
  });
});
