import { nodemailerTransporter } from "@/lib/nodemailer";

/**
 * Send welcome email to new users
 * @param email - Recipient email address
 * @param name - User's name
 */
export async function sendWelcomeEmail(
	email: string,
	name: string,
): Promise<void> {
	const mailOptions = {
		from: `"JobSphere" <${process.env.SMTP_USER}>`,
		to: email,
		subject: "Welcome to JobSphere!",
		html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to JobSphere</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Welcome to JobSphere!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hi ${name}! 👋</h2>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                        Thank you for joining JobSphere! We're excited to have you on board.
                      </p>
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                        JobSphere connects customers with skilled local contractors. Whether you're looking for services or offering your expertise, we're here to help.
                      </p>
                      <p style="margin: 0; color: #666666; font-size: 16px; line-height: 1.5;">
                        If you have any questions, feel free to reach out to our support team.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0; color: #999999; font-size: 14px;">
                        © ${new Date().getFullYear()} JobSphere. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
		text: `
Welcome to JobSphere!

Hi ${name}!

Thank you for joining JobSphere! We're excited to have you on board.

JobSphere connects customers with skilled local contractors. Whether you're looking for services or offering your expertise, we're here to help.

If you have any questions, feel free to reach out to our support team.

© ${new Date().getFullYear()} JobSphere. All rights reserved.
    `,
	};

	await nodemailerTransporter.sendMail(mailOptions);
}
