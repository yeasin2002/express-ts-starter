import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "express-async-errors";
import expressMongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import kleur from "kleur";
import morgan from "morgan";

// Local imports
import { defaultErrorHandler, notFoundHandler } from "./middlewares";
import { rootRouter } from "./router";
import { port } from "./utils";

const app = express();
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());
app.use(expressMongoSanitize());
app.use(morgan("dev"));

app.use("/", rootRouter);
app.use(notFoundHandler);
app.use(defaultErrorHandler);

app.listen(port, () => {
    console.log(
        "⚡",
        kleur
            .bgGreen()
            .white()
            .bold(`Server running on http://localhost:${port}`)
    );
});
