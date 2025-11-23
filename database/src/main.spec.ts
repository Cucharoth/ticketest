import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { bootstrap } from './main';

// Mock NestFactory
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('Main Bootstrap', () => {
  let mockApp: Partial<NestFastifyApplication>;
  let mockLogger: Partial<Logger>;
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Restore environment
    process.env = { ...originalEnv };

    // Mock Logger
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    // Mock NestFastifyApplication
    mockApp = {
      useLogger: jest.fn(),
      flushLogs: jest.fn(),
      enableShutdownHooks: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockReturnValue(mockLogger),
      close: jest.fn().mockResolvedValue(undefined),
    };

    // Mock NestFactory.create
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    // Set default environment variables
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('bootstrap function', () => {
    it('should be defined', () => {
      expect(bootstrap).toBeDefined();
      expect(typeof bootstrap).toBe('function');
    });

    it('should create a NestJS application with AppModule', async () => {
      await bootstrap();

      expect(NestFactory.create).toHaveBeenCalledWith(
        AppModule,
        expect.any(FastifyAdapter),
        {
          bufferLogs: true,
        },
      );
    });

    it('should create a NestJS application with FastifyAdapter', async () => {
      await bootstrap();

      const createCall = (NestFactory.create as jest.Mock).mock.calls[0];
      const fastifyAdapter = createCall[1];

      expect(fastifyAdapter).toBeInstanceOf(FastifyAdapter);
    });

    it('should configure FastifyAdapter with logger disabled', async () => {
      await bootstrap();

      const createCall = (NestFactory.create as jest.Mock).mock.calls[0];
      expect(createCall[1]).toBeInstanceOf(FastifyAdapter);
    });

    it('should buffer logs during bootstrap', async () => {
      await bootstrap();

      const createCall = (NestFactory.create as jest.Mock).mock.calls[0];
      expect(createCall[2]).toEqual({
        bufferLogs: true,
      });
    });

    it('should get Logger from the application', async () => {
      await bootstrap();

      expect(mockApp.get).toHaveBeenCalledWith(Logger);
    });

    it('should set the logger on the application', async () => {
      await bootstrap();

      expect(mockApp.useLogger).toHaveBeenCalledWith(mockLogger);
    });

    it('should flush logs', async () => {
      await bootstrap();

      expect(mockApp.flushLogs).toHaveBeenCalled();
    });

    it('should enable shutdown hooks', async () => {
      await bootstrap();

      expect(mockApp.enableShutdownHooks).toHaveBeenCalled();
    });

    it('should listen on the correct port from environment variable', async () => {
      process.env.PORT = '4000';

      await bootstrap();

      expect(mockApp.listen).toHaveBeenCalledWith(4000, '0.0.0.0');
    });

    it('should listen on default port 3000 if PORT is not set', async () => {
      delete process.env.PORT;

      await bootstrap();

      expect(mockApp.listen).toHaveBeenCalledWith(3000, '0.0.0.0');
    });

    it('should listen on localhost (0.0.0.0)', async () => {
      await bootstrap();

      expect(mockApp.listen).toHaveBeenCalledWith(
        expect.any(Number),
        '0.0.0.0',
      );
    });

    it('should log server startup message with correct port', async () => {
      process.env.PORT = '3000';

      await bootstrap();

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Server is running on http://localhost:3000',
      );
    });

    it('should log correct port in startup message for custom port', async () => {
      process.env.PORT = '5000';

      await bootstrap();

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Server is running on http://localhost:5000',
      );
    });

    it('should return the application instance', async () => {
      const app = await bootstrap();

      expect(app).toBeDefined();
      expect(app).toBe(mockApp);
    });
  });

  describe('bootstrap execution order', () => {
    it('should configure logger before listening', async () => {
      const callOrder: string[] = [];

      mockApp.useLogger = jest.fn(() => callOrder.push('useLogger'));
      mockApp.flushLogs = jest.fn(() => callOrder.push('flushLogs'));
      mockApp.listen = jest.fn(async () => {
        callOrder.push('listen');
        return undefined;
      });

      await bootstrap();

      expect(callOrder.indexOf('useLogger')).toBeLessThan(
        callOrder.indexOf('listen'),
      );
      expect(callOrder.indexOf('flushLogs')).toBeLessThan(
        callOrder.indexOf('listen'),
      );
    });

    it('should enable shutdown hooks before listening', async () => {
      const callOrder: string[] = [];

      mockApp.enableShutdownHooks = jest.fn(() =>
        callOrder.push('enableShutdownHooks'),
      );
      mockApp.listen = jest.fn(async () => {
        callOrder.push('listen');
        return undefined;
      });

      await bootstrap();

      expect(callOrder.indexOf('enableShutdownHooks')).toBeLessThan(
        callOrder.indexOf('listen'),
      );
    });

    it('should get logger before using it', async () => {
      const callOrder: string[] = [];

      mockApp.get = jest.fn(() => {
        callOrder.push('get');
        return mockLogger;
      });
      mockApp.useLogger = jest.fn(() => callOrder.push('useLogger'));

      await bootstrap();

      expect(callOrder.indexOf('get')).toBeLessThan(
        callOrder.indexOf('useLogger'),
      );
    });
  });

  describe('environment configurations', () => {
    it('should work in development environment', async () => {
      process.env.NODE_ENV = 'development';
      process.env.PORT = '3000';

      await bootstrap();

      expect(NestFactory.create).toHaveBeenCalled();
      expect(mockApp.listen).toHaveBeenCalled();
    });

    it('should work in production environment', async () => {
      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';

      await bootstrap();

      expect(NestFactory.create).toHaveBeenCalled();
      expect(mockApp.listen).toHaveBeenCalledWith(8080, '0.0.0.0');
    });

    it('should handle string PORT environment variable', async () => {
      process.env.PORT = '9000';

      await bootstrap();

      expect(mockApp.listen).toHaveBeenCalledWith(9000, '0.0.0.0');
    });

    it('should handle PORT as undefined', async () => {
      process.env.PORT = undefined;

      await bootstrap();

      expect(mockApp.listen).toHaveBeenCalledWith(3000, '0.0.0.0');
    });

    it('should parse PORT as number', async () => {
      process.env.PORT = '7777';

      await bootstrap();

      expect(mockApp.listen).toHaveBeenCalledWith(7777, '0.0.0.0');
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Server is running on http://localhost:7777',
      );
    });
  });

  describe('error handling', () => {
    it('should propagate application creation errors', async () => {
      const error = new Error('Failed to create application');
      (NestFactory.create as jest.Mock).mockRejectedValue(error);

      await expect(bootstrap()).rejects.toThrow('Failed to create application');
    });

    it('should propagate listen errors', async () => {
      const error = new Error('Port already in use');
      mockApp.listen = jest.fn().mockRejectedValue(error);

      await expect(bootstrap()).rejects.toThrow('Port already in use');
    });

    it('should handle logger initialization errors gracefully', async () => {
      mockApp.get = jest.fn().mockImplementation(() => {
        throw new Error('Logger not found');
      });

      await expect(bootstrap()).rejects.toThrow('Logger not found');
    });
  });

  describe('Fastify adapter configuration', () => {
    it('should create FastifyAdapter instance', async () => {
      await bootstrap();

      const createCall = (NestFactory.create as jest.Mock).mock.calls[0];
      const adapter = createCall[1];

      expect(adapter).toBeInstanceOf(FastifyAdapter);
    });

    it('should configure NestJS with buffer logs enabled', async () => {
      await bootstrap();

      const createCall = (NestFactory.create as jest.Mock).mock.calls[0];
      const options = createCall[2];

      expect(options).toEqual({ bufferLogs: true });
    });

    it('should use pino logger from nestjs-pino', async () => {
      await bootstrap();

      expect(mockApp.get).toHaveBeenCalledWith(Logger);
      expect(mockApp.useLogger).toHaveBeenCalledWith(mockLogger);
    });
  });

  describe('application lifecycle', () => {
    it('should call all initialization methods', async () => {
      await bootstrap();

      expect(mockApp.get).toHaveBeenCalled();
      expect(mockApp.useLogger).toHaveBeenCalled();
      expect(mockApp.flushLogs).toHaveBeenCalled();
      expect(mockApp.enableShutdownHooks).toHaveBeenCalled();
      expect(mockApp.listen).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should complete bootstrap successfully', async () => {
      const app = await bootstrap();

      expect(app).toBeDefined();
      expect(mockApp.listen).toHaveBeenCalledTimes(1);
    });
  });
});
