import { Request, Response, NextFunction } from 'express';

export const globalNotFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(404).json({ message: 'Route not found' });
};
