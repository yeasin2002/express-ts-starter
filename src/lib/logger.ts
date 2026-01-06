import path from "node:path";
import { fileURLToPath } from "node:url";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

// Define colors for each level
const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "white",
};

// Tell winston about our colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
	winston.format.errors({ stack: true }),
	winston.format.splat(),
	winston.format.json(),
);

// Define console format (for development)
const consoleFormat = winston.format.combine(
	winston.format.colorize({ all: true }),
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.printf(
		(info) =>
			`${info.timestamp} ${info.level}: ${info.message}${info.stack ? `\n${info.stack}` : ""}`,
	),
);

// Define which transports the logger must use
const transports: winston.transport[] = [
	// Console transport
	new winston.transports.Console({
		format: consoleFormat,
	}),

	// Error logs - Daily rotate file
	new DailyRotateFile({
		filename: path.join(__dirname, "../../logs/error-%DATE%.log"),
		datePattern: "YYYY-MM-DD",
		level: "error",
		maxSize: "20m",
		maxFiles: "14d",
		format,
	}),

	// Combined logs - Daily rotate file
	new DailyRotateFile({
		filename: path.join(__dirname, "../../logs/combined-%DATE%.log"),
		datePattern: "YYYY-MM-DD",
		maxSize: "20m",
		maxFiles: "14d",
		format,
	}),

	// HTTP logs - Daily rotate file
	new DailyRotateFile({
		filename: path.join(__dirname, "../../logs/http-%DATE%.log"),
		datePattern: "YYYY-MM-DD",
		level: "http",
		maxSize: "20m",
		maxFiles: "7d",
		format,
	}),
];

// Create the logger
export const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
	levels,
	format,
	transports,
	exitOnError: false,
});

// Create a stream object for Morgan
export const morganStream = {
	write: (message: string) => {
		logger.http(message.trim());
	},
};

// Helper functions for common logging patterns
export const logError = (
	message: string,
	error?: Error | unknown,
	meta?: any,
) => {
	if (error instanceof Error) {
		logger.error(message, {
			error: {
				message: error.message,
				stack: error.stack,
				name: error.name,
			},
			...meta,
		});
	} else {
		logger.error(message, { error, ...meta });
	}
};

export const logInfo = (message: string, meta?: any) => {
	logger.info(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
	logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
	logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
	logger.http(message, meta);
};

// Log unhandled rejections and exceptions
process.on("unhandledRejection", (reason: Error | any) => {
	logError("Unhandled Rejection", reason);
});

process.on("uncaughtException", (error: Error) => {
	logError("Uncaught Exception", error);
	// Give logger time to write before exiting
	setTimeout(() => {
		process.exit(1);
	}, 1000);
});

export default logger;
