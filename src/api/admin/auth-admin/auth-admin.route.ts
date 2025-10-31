import "./auth-admin.openapi";

import { validateBody } from "@/middleware";
import express, { type Router } from "express";
import { loginAdmin } from "./auth-admin.service";
import { LoginAdminSchema } from "./auth-admin.validation";

export const authAdmin: Router = express.Router();

// Admin login - no authentication required
authAdmin.post("/login", validateBody(LoginAdminSchema), loginAdmin);
