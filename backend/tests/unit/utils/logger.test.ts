import { logger } from '../../../src/utils/logger';

describe('Logger Utils', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  const originalEnv = process.env;

  beforeEach(() => {
    // Giả lập (mock) các hàm console để kiểm tra việc ghi log
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

  /*
  [Description]: Kiểm tra việc ghi log thông tin (info) có gọi console.log và chứa tag [INFO] hay không.
  [Pre-condition]: Console log được mock.
  [Data Test]: message='Info message', meta={ data: 123 }
  [Steps]: 
    1. Gọi hàm logger.info với message và meta data.
  [Expected Result]: 
    - console.log được gọi.
    - Nội dung log chứa chuỗi '[INFO]' và dữ liệu '123'.
  */
  it('should log info message', () => {
    logger.info('Info message', { data: 123 });
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      expect.stringContaining('123')
    );
  });

  /*
  [Description]: Kiểm tra việc ghi log lỗi (error) có gọi console.error và chứa tag [ERROR] hay không.
  [Pre-condition]: Console error được mock.
  [Data Test]: message='Error message'
  [Steps]: 
    1. Gọi hàm logger.error.
  [Expected Result]: 
    - console.error được gọi.
    - Nội dung log chứa chuỗi '[ERROR]'.
  */
  it('should log error message', () => {
    logger.error('Error message');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      expect.anything()
    );
  });

  /*
  [Description]: Kiểm tra việc ghi log cảnh báo (warn) có gọi console.warn và chứa tag [WARN] hay không.
  [Pre-condition]: Console warn được mock.
  [Data Test]: message='Warn message'
  [Steps]: 
    1. Gọi hàm logger.warn.
  [Expected Result]: 
    - console.warn được gọi.
    - Nội dung log chứa chuỗi '[WARN]'.
  */
  it('should log warn message', () => {
    logger.warn('Warn message');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]'),
      expect.anything()
    );
  });

  /*
  [Description]: Kiểm tra xem log debug có được ghi khi biến môi trường NODE_ENV là 'development' hay không.
  [Pre-condition]: Môi trường được set là 'development'.
  [Data Test]: NODE_ENV='development', message='Debug message'
  [Steps]: 
    1. Gán process.env.NODE_ENV = 'development'.
    2. Gọi hàm logger.debug.
  [Expected Result]: 
    - console.log được gọi.
    - Nội dung log chứa chuỗi '[DEBUG]'.
  */
  it('should log debug message when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';
    logger.debug('Debug message');
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]'),
      expect.anything()
    );
  });

  /*
  [Description]: Kiểm tra xem log debug có KHÔNG được ghi khi biến môi trường NODE_ENV không phải là 'development' (ví dụ: 'production') hay không.
  [Pre-condition]: Môi trường được set là 'production'.
  [Data Test]: NODE_ENV='production', message='Debug message'
  [Steps]: 
    1. Gán process.env.NODE_ENV = 'production'.
    2. Gọi hàm logger.debug.
  [Expected Result]: console.log KHÔNG được gọi (log bị ẩn).
  */
  it('should NOT log debug message when NODE_ENV is not development', () => {
    process.env.NODE_ENV = 'production';
    logger.debug('Debug message');
    expect(logSpy).not.toHaveBeenCalled();
  });
});