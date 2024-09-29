import type { Request, Response, NextFunction } from 'express';

type PrintFunc = (message: string) => void;

const defaultPrint: PrintFunc = (message) => {
  console.log(message);
};

const getStatusColor = (statusCode: number): string => {
  if (statusCode >= 200 && statusCode < 300) return '\x1b[32m'; // Green for 2xx
  if (statusCode >= 300 && statusCode < 400) return '\x1b[36m'; // Cyan for 3xx
  if (statusCode >= 400 && statusCode < 500) return '\x1b[33m'; // Yellow for 4xx
  if (statusCode >= 500) return '\x1b[31m'; // Red for 5xx
  return '\x1b[0m'; // Reset color
};

const resetColor = '\x1b[0m';

export const logger = (printFunc: PrintFunc = defaultPrint) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime();
    const { method, path } = req;

    printFunc(`Incoming Request: ${method} ${path}`);

    res.on('finish', () => {
      const elapsedTime = process.hrtime(startTime);
      const elapsedMillis = elapsedTime[0] * 1000 + elapsedTime[1] / 1e6;
      const statusCodeColor = getStatusColor(res.statusCode);
      const elapsedTimeString =
        elapsedMillis < 1000
          ? `${elapsedMillis.toFixed(2)} ms`
          : `${(elapsedMillis / 1000).toFixed(2)} s`;

      printFunc(
        `${statusCodeColor}Outgoing Response: ${method} ${path} - Status: ${res.statusCode} - Elapsed Time: ${elapsedTimeString}${resetColor}`,
      );
    });

    next();
  };
};
