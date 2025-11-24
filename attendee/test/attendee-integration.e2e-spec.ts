import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import axios from 'axios';

describe('AttendeeController (e2e)', () => {
  let app: INestApplication;
  let eventId: string;
  let attendeeId: string;

  const dbServiceUrl = process.env.DB_SERVICE_URL || 'http://localhost:3000';

  beforeAll(async () => {
    // 1. Create a Test Event Type and Event in the Database Module directly
    try {
      // Create Event Type
      const typeResponse = await axios.post(`${dbServiceUrl}/event-types`, {
        name: 'Integration Test Type',
      });
      const typeId = typeResponse.data.id;

      // Create Event
      const eventResponse = await axios.post(`${dbServiceUrl}/events`, {
        name: 'Integration Test Event',
        date: new Date().toISOString(),
        place: 'Test Place',
        ticketMax: 100,
        ticketsLeft: 100,
        ticketSold: 0,
        typeId: typeId,
      });
      eventId = eventResponse.data.id;
    } catch (error) {
      console.error('Error setting up test data:', error.response?.data || error.message);
      throw error;
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Cleanup if possible, or just close app
    await app.close();
  });

  // AST-INT-01: Register assistant (Happy Path)
  it('/attendee-events (POST) - AST-INT-01', async () => {
    const dto = {
      name: 'Integration User',
      email: `integration-${Date.now()}@example.com`,
      cellphone: '1234567890',
      eventId: eventId,
    };

    return request(app.getHttpServer())
      .post('/attendee-events')
      .send(dto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toEqual(dto.name);
        expect(res.body.email).toEqual(dto.email);
        attendeeId = res.body.id; // Store for next tests
      });
  });

  // AST-INT-03: Confirm assistance
  it('/attendee-events/confirm (POST) - AST-INT-03', async () => {
    const dto = { attendeeId: attendeeId, eventId: eventId, confirmed: true };

    return request(app.getHttpServer())
      .post('/attendee-events/confirm')
      .send(dto)
      .expect(201)
      .catch((err) => {
        if (err.response) {
          console.error('Confirm Error Response:', JSON.stringify(err.response.body, null, 2));
          console.error('Confirm Error Status:', err.response.status);
        }
        throw err;
      })
      .then((res) => {
        expect(res.body.confirmed).toBe(true);
      });
  });

  // AST-INT-05: List assistants
  // HUMO-02 (AST -> DB)
  it('/attendee-events (GET) - AST-INT-05 / HUMO-02', async () => {
    return request(app.getHttpServer())
      .get('/attendee-events')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        const found = res.body.find((a) => a.id === attendeeId);
        // Note: The GET /attendee-events might return AttendeeEvent objects which have 'attendee' relation
        // or it might return the Attendee objects depending on implementation.
        // Let's check the structure. AttendeeService.findAll calls /attendee-events.
        // Database Module /attendee-events returns AttendeeEvent[].
        // So we look for an item where attendeeId matches.
        const foundEvent = res.body.find((a) => a.attendeeId === attendeeId && a.eventId === eventId);
        expect(foundEvent).toBeDefined();
      });
  });

  // AST-INT-06: List assistants by event
  it('/attendee-events/events/:id (GET) - AST-INT-06', async () => {
    return request(app.getHttpServer())
      .get(`/attendee-events/events/${eventId}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        const found = res.body.find((a) => a.attendeeId === attendeeId);
        expect(found).toBeDefined();
      });
  });
});
