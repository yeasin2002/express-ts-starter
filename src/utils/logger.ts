import winston from 'winston';
import path from 'path';

const logFilePath = path.join(__dirname, '../../log');

export const logger = winston.createLogger({
  level: 'info', // Log level to capture
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamps to logs
    winston.format.json(), // Use JSON format for logging
  ),
  transports: [
    new winston.transports.File({
      filename: logFilePath, // Use the 'log' file in the root directory
      level: 'info', // Log all levels starting from 'info'
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Add colors for console logs
        winston.format.simple(), // Simple format for console
      ),
    }),
  );
}
