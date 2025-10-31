import "./img-upload/img-upload.openapi";

import { upload } from "@/lib/multer";
import { requireAuth } from "@/middleware";
import express, { type Router } from "express";
import { uploadImage } from "./img-upload/upload-image.service";

export const common: Router = express.Router();

// Single image upload route using centralized multer config
common.post("/upload", requireAuth, upload.single("image"), uploadImage);
