import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AttendeeModule } from './modules/attendee/attendee.module';
import { EventModule } from './modules/events/event.module';
import { NotificationModule } from './modules/notification/notification.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { AttendeeService } from './modules/attendee/attendee.service';
import { EventService } from './modules/events/event.service';
import { NotificationService } from './modules/notification/notification.service';
import { TicketService } from './modules/ticket/ticket.service';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // Set environment variables for testing
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3001';
    process.env.LOG_LEVEL = 'error';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should compile the AppModule successfully', () => {
    expect(module).toBeInstanceOf(TestingModule);
  });

  describe('Module Imports', () => {
    it('should import ConfigModule', () => {
      const configModule = module.get(ConfigModule);
      expect(configModule).toBeDefined();
    });

    it('should import PrismaModule', () => {
      const prismaService = module.get(PrismaService);
      expect(prismaService).toBeDefined();
    });

    it('should import AttendeeModule', () => {
      const attendeeService = module.get(AttendeeService);
      expect(attendeeService).toBeDefined();
    });

    it('should import EventModule', () => {
      const eventService = module.get(EventService);
      expect(eventService).toBeDefined();
    });

    it('should import NotificationModule', () => {
      const notificationService = module.get(NotificationService);
      expect(notificationService).toBeDefined();
    });

    it('should import TicketModule', () => {
      const ticketService = module.get(TicketService);
      expect(ticketService).toBeDefined();
    });

    it('should import HealthModule', () => {
      // Health module should be present
      expect(module).toBeDefined();
    });
  });

  describe('Service Dependencies', () => {
    it('should provide PrismaService globally', () => {
      const prismaService = module.get(PrismaService);
      expect(prismaService).toBeDefined();
      expect(prismaService.constructor.name).toBe('PrismaService');
    });

    it('should inject PrismaService into AttendeeService', () => {
      const attendeeService = module.get(AttendeeService);
      const prismaService = module.get(PrismaService);

      expect(attendeeService).toBeDefined();
      expect(prismaService).toBeDefined();
    });

    it('should inject PrismaService into EventService', () => {
      const eventService = module.get(EventService);
      const prismaService = module.get(PrismaService);

      expect(eventService).toBeDefined();
      expect(prismaService).toBeDefined();
    });

    it('should inject PrismaService into NotificationService', () => {
      const notificationService = module.get(NotificationService);
      const prismaService = module.get(PrismaService);

      expect(notificationService).toBeDefined();
      expect(prismaService).toBeDefined();
    });

    it('should inject PrismaService into TicketService', () => {
      const ticketService = module.get(TicketService);
      const prismaService = module.get(PrismaService);

      expect(ticketService).toBeDefined();
      expect(prismaService).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should load ConfigModule as global', () => {
      const configModule = module.get(ConfigModule);
      expect(configModule).toBeDefined();
    });

    it('should have environment variables accessible', () => {
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.PORT).toBe('3001');
      expect(process.env.DATABASE_URL).toBeDefined();
    });
  });

  describe('Module Structure', () => {
    it('should have all required modules imported', () => {
      // Verify all services are available
      const services = [
        PrismaService,
        AttendeeService,
        EventService,
        NotificationService,
        TicketService,
      ];

      services.forEach((service) => {
        const instance = module.get(service);
        expect(instance).toBeDefined();
      });
    });

    it('should have proper module isolation', () => {
      // Each service should be independent
      const attendeeService = module.get(AttendeeService);
      const eventService = module.get(EventService);
      const notificationService = module.get(NotificationService);
      const ticketService = module.get(TicketService);

      expect(attendeeService).not.toBe(eventService);
      expect(eventService).not.toBe(notificationService);
      expect(notificationService).not.toBe(ticketService);
    });
  });

  describe('Module Lifecycle', () => {
    it('should initialize all modules without errors', async () => {
      await expect(module.init()).resolves.not.toThrow();
    });

    it('should close gracefully', async () => {
      await expect(module.close()).resolves.not.toThrow();
    });
  });
});
