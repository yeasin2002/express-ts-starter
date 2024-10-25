import winston from "winston";

// const logFilePath = process.cwd() + '/logs';

export const winstonLogger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});
