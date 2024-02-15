import * as dotenv from "dotenv";
dotenv.config();

export const ClientUrl = process.env.CLIENT_URL || ``;
export const port = process.env.SERVER_PORT || ``;
export const mongoUrl = process.env.MONGO_CONNECTION_STRING || ``;
export const jwtSecretKey = process.env.JWT_SECRET_KEY || ``;
export const defaultImagePath = process.env.DEFAULT_IMAGE_PATH || ``;
