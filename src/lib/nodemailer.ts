// Cons: Gmail SMTP has sending limits (about 500/day).

import nodemailer from "nodemailer";

export const nodemailerTransporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});
