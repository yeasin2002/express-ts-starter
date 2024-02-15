import nodemailer from "nodemailer";

// SMTP Config, move to exportEnt file if needed
const smtpUsername = process.env.SMTP_USERNAME || "";
const smtpPassword = process.env.SMTP_PASSWORD || "";

interface NodemailerArg {
    receivers: string;
    subject: string;
    text?: string;
    html: string;
}

export async function sendMailWithNodemailer(args: NodemailerArg) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: smtpUsername,
            pass: smtpPassword,
        },
    });

    const mailOptions = {
        from: "", // sender address - add your email
        to: args.receivers, // list of receivers
        subject: args.subject, // Subject line
        text: args.text, // plain text body
        html: args.html, // html body
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email  sent via nodemailer to : %s", info.messageId);
    } catch (error) {
        console.error("Error occurred while sending email", error);
        throw new Error("Error occurred while sending email");
    }
}
