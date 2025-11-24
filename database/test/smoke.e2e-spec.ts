import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

describe('Database Module Smoke Tests', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Health check - should return OK', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({ status: 'OK' });
  });

  it('GET /attendee-events - should return 200 OK', async () => {
    await request(app.getHttpServer())
      .get('/attendee-events')
      .expect(200);
  });

  it('GET /notifications - should return 200 OK', async () => {
    await request(app.getHttpServer())
      .get('/notifications')
      .expect(200);
  });

  it('GET /events - should return 200 OK', async () => {
    await request(app.getHttpServer())
      .get('/events')
      .expect(200);
  });
});
