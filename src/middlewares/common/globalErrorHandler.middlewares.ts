import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Internal Server Error' });
};
