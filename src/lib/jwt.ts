import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";

// const ACCESS_EXPIRES = "15m"; // short-lived
const ACCESS_EXPIRES = "15d"; // short-lived
// const ACCESS_EXPIRES = "1m"; // short-lived
const REFRESH_EXPIRES_DAYS = 30; // refresh token lifetime

const ACCESS_SECRET = process.env.ACCESS_SECRET || "access-secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh-secret";

export interface TokenPayload {
	userId: string;
	email: string;
	role: "customer" | "contractor" | "admin";
}

export interface AccessTokenPayload extends TokenPayload, JwtPayload {}

export interface RefreshTokenPayload extends TokenPayload, JwtPayload {
	jti: string;
}

export function signAccessToken(payload: TokenPayload): string {
	return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function signRefreshToken(payload: TokenPayload): {
	token: string;
	jti: string;
} {
	const jti = crypto.randomBytes(16).toString("hex");
	const token = jwt.sign({ ...payload, jti }, REFRESH_SECRET, {
		expiresIn: `${REFRESH_EXPIRES_DAYS}d`,
	});
	return { token, jti };
}

export async function hashPassword(password: string): Promise<string> {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(password, salt);
}

export async function comparePassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export async function hashToken(tokenOrId: string): Promise<string> {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(tokenOrId, salt);
}

export async function compareHash(
	tokenOrId: string,
	hash: string,
): Promise<boolean> {
	return bcrypt.compare(tokenOrId, hash);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
	return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
	return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
}

export function generateOTP(): string {
	return Math.floor(1000 + Math.random() * 9000)
		.toString()
		.padStart(4, "0");
}
