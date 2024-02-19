/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpCode from "http-status-codes";

export const defaultErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);
    res.status(httpCode.INTERNAL_SERVER_ERROR).send(err.message); // modify as  you want
};
