import { apiReference } from "@scalar/express-api-reference";
import cors from "cors";
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";



// common routes

import { generateOpenAPIDocument } from "@/lib";
import { errorHandler, notFoundHandler } from "@/middleware";

import { getLocalIP } from "./lib/get-my-ip";
import { morganDevFormat } from "./lib/morgan";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
app.use(morgan(morganDevFormat));

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5173", "*"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// OpenAPI documentation
const openApiDocument = generateOpenAPIDocument();
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use(
  "/scaler",
  apiReference({
    theme: "deepSpace",
    content: openApiDocument,
    favicon: "/uploads/logo.png",
  })
);
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(openApiDocument);
});

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, async () => {
  // await connectDB();

  console.log(`🚀 Server is running on port http://localhost:${port}`);
  console.log(`✨ Server is running on port http://${getLocalIP()}:${port} \n`);

  console.log(`✍️ Swagger doc: http://localhost:${port}/swagger`);
  console.log(`📋 Scaler doc: http://localhost:${port}/scaler \n`);
});
