// src/utils/logger.ts
import { createWriteStream } from 'fs';
// import { format, transports, createLogger } from 'winston'; // Nếu dùng winston, cài npm i winston
// Nếu không muốn winston, dùng console đơn giản bên dưới

// Phiên bản đơn giản dùng console (không cần install thêm)
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  },
};

// Phiên bản nâng cao với winston (uncomment nếu cài winston)
// const logger = createLogger({
//   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
//   format: format.combine(
//     format.timestamp(),
//     format.errors({ stack: true }),
//     format.json()
//   ),
//   transports: [
//     new transports.Console({
//       format: format.combine(
//         format.colorize(),
//         format.simple()
//       )
//     }),
//     new transports.File({ filename: 'error.log', level: 'error' }),
//     new transports.File({ filename: 'combined.log' })
//   ],
// });

// export default logger;

export default logger;