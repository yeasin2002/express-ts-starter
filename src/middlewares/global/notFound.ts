/* eslint-disable @typescript-eslint/no-unused-vars */
import httpCode from "http-status-codes";

import { NextFunction, Request, Response } from "express";

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(httpCode.NOT_FOUND).send({ error: "Resource not found" });
    // modify as  you want
};
