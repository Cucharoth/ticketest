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

  /**
   * HUMO-04 (AST -> NOT): POST /attendee-events -> 201 Created -> Notification sent
   * Verifies that creating an attendee triggers a notification to be sent
   */
  it('HUMO-04: POST /attendee-events - should create attendee and trigger notification', async () => {
    const dto = {
      name: 'Smoke Test User',
      email: `smoke-${Date.now()}@test.com`,
      cellphone: '9876543210',
    };

    const response = await request(app.getHttpServer())
      .post('/attendee-events')
      .send(dto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(dto.name);
    
    const attendeeId = response.body.id;
    
    // Wait a bit for async notification to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify notification was sent by checking the database
    const dbServiceUrl = process.env.DB_SERVICE_URL || 'http://localhost:3000';
    const notificationResponse = await request(dbServiceUrl)
      .get('/notifications')
      .expect(200);
    
    // Find notification for this attendee
    const notifications = notificationResponse.body;
    const welcomeNotification = notifications.find(
      (n: any) => n.attendeeId === attendeeId && n.message.includes('Bienvenido')
    );
    
    expect(welcomeNotification).toBeDefined();
    expect(welcomeNotification.attendeeId).toBe(attendeeId);
  });
});
