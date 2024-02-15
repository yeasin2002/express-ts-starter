import { NextFunction, Request, Response } from "express";
import kleur from "kleur";

export const reqLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on("finish", () => {
        const status =
            req.statusCode >= 500
                ? kleur.red(res.statusCode)
                : kleur.green(res.statusCode);

        let method;
        if (req.method === "GET") {
            method = kleur.green(req.method);
        } else if (req.method === "POST") {
            method = kleur.blue(req.method);
        } else if (req.method === "PUT") {
            method = kleur.yellow(req.method);
        } else if (req.method === "DELETE") {
            method = kleur.red(req.method);
        } else {
            method = kleur.white(req.method);
        }

        let duration;
        if (res.statusCode <= 200) {
            duration = kleur.green(Date.now() - start);
        } else if (res.statusCode > 200) {
            duration = kleur.yellow(Date.now() - start);
        } else if (res.statusCode > 500) {
            duration = kleur.red(Date.now() - start);
        }

        console.log(
            `${method} ${req.originalUrl} ${status} - ${kleur.blue(
                duration
            )} ms`
        );
    });

    next();
};
