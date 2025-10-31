import { apiReference } from "@scalar/express-api-reference";
import cors from "cors";
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { auth } from "@/api/auth/auth.route";
import { category } from "@/api/category/category.route";
import { jobRequest } from "@/api/job-request/job-request.route";
import { job } from "@/api/job/job.route";
import { location } from "@/api/location/location.route";
import { review } from "@/api/review/review.route";

// admin- dashboard routes
import { adminUser } from "@/api/admin/admin-user/admin-user.route";

// common routes

import { connectDB, generateOpenAPIDocument } from "@/lib";
import {
	errorHandler,
	notFoundHandler,
	requireAuth,
	requireRole,
} from "@/middleware";
import { authAdmin } from "./api/admin/auth-admin/auth-admin.route";
// import { authAdmin } from "./api/admin/admin-user";
import { common } from "./api/common/common.route";
import { users } from "./api/users/users.route";
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
	}),
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
	}),
);
app.get("/api-docs.json", (_req, res) => {
	res.setHeader("Content-Type", "application/json");
	res.send(openApiDocument);
});

app.use("/api/auth", auth);
app.use("/api/job", job);
app.use("/api/job-request", jobRequest);

app.use("/api/category", category);
app.use("/api/location", location);
app.use("/api/review", review);
app.use("/api/common", common);

// Admin routes
app.use("/api/admin/auth", authAdmin);

// Protected admin routes (require admin authentication)
app.use("/api/admin/users", requireAuth, requireRole("admin"), adminUser);

// normal  routes
app.use("/api/user", users);

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, async () => {
	await connectDB();

	console.log(`🚀 Server is running on port http://localhost:${port}`);
	console.log(`✨ Server is running on port http://${getLocalIP()}:${port} \n`);

	console.log(`✍️ Swagger doc: http://localhost:${port}/swagger`);
	console.log(`📋 Scaler doc: http://localhost:${port}/scaler \n`);
});
