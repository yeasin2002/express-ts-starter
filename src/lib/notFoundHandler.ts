import type { Request, Response, NextFunction } from 'express';

// Not Found Handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  res.status(404).json({
    message: 'Resource not found',
  });
};
