import path from "path";
import { PORT } from "@/config";
import {
  globalErrorHandler,
  globalNotFoundHandler,
} from "@/middlewares/common";
import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import type { Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swaggerConfig";

export const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of users
 *     responses:
 *       200:
 *         description: Successfully retrieved list
 */
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ data: `Hello, world! - ${PORT}` });
});

app.use(globalNotFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
