import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import kleur from "kleur";

import { port, reqLogger } from "./utils";

import { connectDB } from "./utils";

const app = express();
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(helmet());
app.use(reqLogger);
app.use(
    cors({
        credentials: true,
    })
);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, async () => {
    await connectDB();
    console.log(
        "⚡",
        kleur
            .bgGreen()
            .white()
            .bold(`Server running on http://localhost:${port}`)
    );
});
