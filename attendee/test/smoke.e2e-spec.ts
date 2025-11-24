import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Attendee Module Smoke Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * HUMO-02 (AST -> DB): GET /attendee-events -> 200 OK
   * Verifies connectivity between Attendee Module and Database Module
   */
  it('HUMO-02: GET /attendee-events - should return 200 OK', async () => {
    const response = await request(app.getHttpServer())
      .get('/attendee-events')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('Health check - module is responsive', async () => {
    await request(app.getHttpServer())
      .get('/attendee-events')
      .expect(200);
  });
});
