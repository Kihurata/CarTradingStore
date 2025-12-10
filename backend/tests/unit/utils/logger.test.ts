import { logger } from '../../../src/utils/logger';

describe('Logger Utils', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  const originalEnv = process.env;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = originalEnv;
  });

  it('should log info message', () => {
    logger.info('Info message', { data: 123 });
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      expect.stringContaining('123')
    );
  });

  it('should log error message', () => {
    logger.error('Error message');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      expect.anything()
    );
  });

  it('should log warn message', () => {
    logger.warn('Warn message');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]'),
      expect.anything()
    );
  });

  it('should log debug message when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';
    logger.debug('Debug message');
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]'),
      expect.anything()
    );
  });

  it('should NOT log debug message when NODE_ENV is not development', () => {
    process.env.NODE_ENV = 'production';
    logger.debug('Debug message');
    expect(logSpy).not.toHaveBeenCalled();
  });
});