import "module-alias/register";

import express from "express";
import type { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

import { logger } from "@/Middlewares";
import { limiter, defaultErrorHandler, notFoundHandler } from "@/lib";
import { port } from "@/config";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(compression());

app.use(logger());
app.use(limiter);

app.get("/", (req: Request, res: Response) => {
    res.send(`Hello, TypeScript Express!  ${port} `);
});

app.use(notFoundHandler);
app.use(defaultErrorHandler);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
