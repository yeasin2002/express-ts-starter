import "express";

declare module "express-serve-static-core" {
  interface Request {
    body: {
      name?: string;
      [key: string]: any; // optional flexibility
    };
  }
}
