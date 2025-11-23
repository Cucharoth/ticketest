import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

describe('Application E2E Tests', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  // Set timeout for all tests in this suite
  jest.setTimeout(30000);

  // Test data IDs
  let attendeeId: string;
  let eventTypeId: string;
  let eventId: string;
  let attendeeEventId: string;
  let notificationTypeId: string;
  let notificationId: string;
  let ticketTypeId: string;
  let ticketId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    // Clean database efficiently
    try {
      await prisma.$executeRaw`TRUNCATE TABLE "attendee_event" CASCADE`;
      await prisma.$executeRaw`TRUNCATE TABLE "ticket_event" CASCADE`;
      await prisma.$executeRaw`TRUNCATE TABLE "notification" CASCADE`;
      await prisma.$executeRaw`TRUNCATE TABLE "ticket" CASCADE`;
      await prisma.$executeRaw`TRUNCATE TABLE "event" CASCADE`;
      await prisma.$executeRaw`TRUNCATE TABLE "attendee" CASCADE`;
      await prisma.$executeRaw`TRUNCATE TABLE "event_type" CASCADE`;
      await prisma.$executeRaw`TRUNCATE TABLE "notification_type" CASCADE`;
      await prisma.$executeRaw`TRUNCATE TABLE "ticket_type" CASCADE`;
    } catch (error) {
      console.error('Failed to clean database:', error);
    }
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  });

  describe('Health Check', () => {
    it('/health (GET) - should return OK', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'OK' });
    });
  });

  describe('Attendees Module', () => {
    it('/attendees (POST) - should create an attendee', async () => {
      const response = await request(app.getHttpServer())
        .post('/attendees')
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com',
          cellphone: '+1234567890',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john.doe@example.com');
      attendeeId = response.body.id;
    });

    it('/attendees (GET) - should return all attendees', async () => {
      const response = await request(app.getHttpServer())
        .get('/attendees')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/attendees/:id (GET) - should return single attendee', async () => {
      const response = await request(app.getHttpServer())
        .get(`/attendees/${attendeeId}`)
        .expect(200);

      expect(response.body.id).toBe(attendeeId);
      expect(response.body.name).toBe('John Doe');
    });

    it('/attendees/:id (PATCH) - should update attendee', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/attendees/${attendeeId}`)
        .send({ name: 'Jane Doe' })
        .expect(200);

      expect(response.body.name).toBe('Jane Doe');
    });

    it('/attendees (POST) - should fail with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/attendees')
        .send({ name: 'Test', email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('Events Module', () => {
    beforeAll(async () => {
      // Create event type
      const eventType = await prisma.eventType.create({
        data: { name: 'Concert' },
      });
      eventTypeId = eventType.id;
    });

    it('/events (POST) - should create an event', async () => {
      const response = await request(app.getHttpServer())
        .post('/events')
        .send({
          name: 'Rock Concert',
          date: new Date('2024-12-31T20:00:00Z').toISOString(),
          place: 'Stadium',
          ticketMax: 100,
          ticketsLeft: 100,
          ticketSold: 0,
          typeId: eventTypeId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Rock Concert');
      eventId = response.body.id;
    });

    it('/events (GET) - should return all events', async () => {
      const response = await request(app.getHttpServer())
        .get('/events')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/events/:id (GET) - should return single event', async () => {
      const response = await request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .expect(200);

      expect(response.body.id).toBe(eventId);
      expect(response.body.name).toBe('Rock Concert');
    });

    it('/events/:id (PATCH) - should update event', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/events/${eventId}`)
        .send({ name: 'Updated Rock Concert', place: 'Arena' })
        .expect(200);

      expect(response.body.name).toBe('Updated Rock Concert');
      expect(response.body.place).toBe('Arena');
    });
  });

  describe('AttendeeEvents Module', () => {
    it('/attendee-events (POST) - should create attendee-event', async () => {
      const response = await request(app.getHttpServer())
        .post('/attendee-events')
        .send({
          eventId,
          attendeeId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.eventId).toBe(eventId);
      expect(response.body.attendeeId).toBe(attendeeId);
      attendeeEventId = response.body.id;
    });

    it('/attendee-events (GET) - should return all attendee-events', async () => {
      const response = await request(app.getHttpServer())
        .get('/attendee-events')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/attendee-events/:id (GET) - should return single attendee-event', async () => {
      const response = await request(app.getHttpServer())
        .get(`/attendee-events/${attendeeEventId}`)
        .expect(200);

      expect(response.body.id).toBe(attendeeEventId);
      expect(response.body.eventId).toBe(eventId);
      expect(response.body.attendeeId).toBe(attendeeId);
    });

    it('/attendee-events/:id (PATCH) - should update attendee-event', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/attendee-events/${attendeeEventId}`)
        .send({})
        .expect(200);

      expect(response.body.id).toBe(attendeeEventId);
    });

    it('/attendee-events/:id/attendees/:attendeeId (GET) - should return attendee-events for given event and attendee', async () => {
      const response = await request(app.getHttpServer())
        .get(`/attendee-events/${eventId}/attendees/${attendeeId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // There should be at least one mapping created earlier in the flow
      expect(response.body.length).toBeGreaterThan(0);
      // Validate the first returned item matches the requested attendee and event
      expect(response.body[0].attendeeId).toBe(attendeeId);
      expect(response.body[0].eventId).toBe(eventId);
    });

    describe('Notifications Module', () => {
      beforeAll(async () => {
        // Create notification type
        const notifType = await prisma.notificationType.create({
          data: { type: 'EMAIL' },
        });
        notificationTypeId = notifType.id;
      });

      it('/notifications (POST) - should create a notification', async () => {
        const response = await request(app.getHttpServer())
          .post('/notifications')
          .send({
            message: 'Your ticket has been confirmed',
            sendDate: new Date('2024-12-25T10:00:00Z').toISOString(),
            attendeeId: attendeeId,
            type: notificationTypeId,
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.message).toBe('Your ticket has been confirmed');
        notificationId = response.body.id;
      });

      it('/notifications (GET) - should return all notifications', async () => {
        const response = await request(app.getHttpServer())
          .get('/notifications')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });

      it('/notifications/:id (GET) - should return single notification', async () => {
        const response = await request(app.getHttpServer())
          .get(`/notifications/${notificationId}`)
          .expect(200);

        expect(response.body.id).toBe(notificationId);
        expect(response.body.message).toBe('Your ticket has been confirmed');
      });

      it('/notifications/attendee/:attendeeId (GET) - should return attendee notifications', async () => {
        const response = await request(app.getHttpServer())
          .get(`/notifications/attendee/${attendeeId}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });

      it('/notifications/:id (PATCH) - should update notification', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/notifications/${notificationId}`)
          .send({ message: 'Updated notification message' })
          .expect(200);

        expect(response.body.message).toBe('Updated notification message');
      });
    });

    describe('Tickets Module', () => {
      beforeAll(async () => {
        // Create ticket type
        const tickType = await prisma.ticketType.create({
          data: { type: 'VIP' },
        });
        ticketTypeId = tickType.id;
      });

      it('/tickets (POST) - should create a ticket', async () => {
        const response = await request(app.getHttpServer())
          .post('/tickets')
          .send({
            price: 99.99,
            typeId: ticketTypeId,
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(parseFloat(response.body.price)).toBe(99.99);
        ticketId = response.body.id;
      });

      it('/tickets (GET) - should return all tickets', async () => {
        const response = await request(app.getHttpServer())
          .get('/tickets')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });

      it('/tickets/:id (GET) - should return single ticket', async () => {
        const response = await request(app.getHttpServer())
          .get(`/tickets/${ticketId}`)
          .expect(200);

        expect(response.body.id).toBe(ticketId);
      });

      it('/tickets/type/:typeId (GET) - should return tickets by type', async () => {
        const response = await request(app.getHttpServer())
          .get(`/tickets/type/${ticketTypeId}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });

      it('/tickets/:id (PATCH) - should update ticket', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/tickets/${ticketId}`)
          .send({ price: 149.99 })
          .expect(200);

        expect(parseFloat(response.body.price)).toBe(149.99);
      });

      it('/tickets (POST) - should fail with invalid price', async () => {
        await request(app.getHttpServer())
          .post('/tickets')
          .send({ price: -10, typeId: ticketTypeId })
          .expect(400);
      });
    });

    describe('Delete Operations', () => {
      it('/notifications/:id (DELETE) - should delete notification', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/notifications/${notificationId}`)
          .expect(200);

        expect(response.body.id).toBe(notificationId);

        // Verify deletion
        await request(app.getHttpServer())
          .get(`/notifications/${notificationId}`)
          .expect(404);
      });

      it('/attendee-events/:id (DELETE) - should delete attendee-event', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/attendee-events/${attendeeEventId}`)
          .expect(200);

        expect(response.body.id).toBe(attendeeEventId);

        // Verify deletion
        await request(app.getHttpServer())
          .get(`/attendee-events/${attendeeEventId}`)
          .expect(404);
      });

      it('/tickets/:id (DELETE) - should delete ticket', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/tickets/${ticketId}`)
          .expect(200);

        expect(response.body.id).toBe(ticketId);

        // Verify deletion
        await request(app.getHttpServer())
          .get(`/tickets/${ticketId}`)
          .expect(404);
      });

      it('/events/:id (DELETE) - should delete event', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/events/${eventId}`)
          .expect(200);

        expect(response.body.id).toBe(eventId);

        // Verify deletion
        await request(app.getHttpServer())
          .get(`/events/${eventId}`)
          .expect(404);
      });

      it('/attendees/:id (DELETE) - should delete attendee', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/attendees/${attendeeId}`)
          .expect(200);

        expect(response.body.id).toBe(attendeeId);

        // Verify deletion
        await request(app.getHttpServer())
          .get(`/attendees/${attendeeId}`)
          .expect(404);
      });
    });

    describe('Error Handling', () => {
      it('should return 404 for non-existent attendee', async () => {
        await request(app.getHttpServer())
          .get('/attendees/123e4567-e89b-12d3-a456-426614174999')
          .expect(404);
      });

      it('should return 400 for invalid UUID', async () => {
        await request(app.getHttpServer())
          .get('/attendees/invalid-uuid')
          .expect(400);
      });

      it('should return 404 for non-existent endpoint', async () => {
        await request(app.getHttpServer())
          .get('/non-existent-route')
          .expect(404);
      });
    });
  });
});
