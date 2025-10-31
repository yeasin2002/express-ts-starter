import { nodemailerTransporter } from "@/lib/nodemailer";

/**
 * Send OTP email for password reset
 * @param email - Recipient email address
 * @param otp - 6-digit OTP code
 * @param name - User's name (optional)
 */
export async function sendOTPEmail(
	email: string,
	otp: string,
	name?: string,
): Promise<void> {
	const mailOptions = {
		from: `"JobSphere" <${process.env.SMTP_USER}>`,
		to: email,
		subject: "Password Reset OTP - JobSphere",
		html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">JobSphere</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Password Reset Request</h2>
                      
                      ${
												name
													? `<p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">Hi ${name},</p>`
													: ""
											}
                      
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                        We received a request to reset your password. Use the OTP code below to verify your identity:
                      </p>
                      
                      <!-- OTP Box -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                        <tr>
                          <td align="center" style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 2px dashed #667eea;">
                            <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                              ${otp}
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                        This OTP will expire in <strong>15 minutes</strong>.
                      </p>
                      
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                        If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                      </p>
                      
                      <!-- Warning Box -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                          <td style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                              <strong>Security Tip:</strong> Never share your OTP with anyone. JobSphere will never ask for your OTP via phone or email.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                        This is an automated email, please do not reply.
                      </p>
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
JobSphere - Password Reset OTP

${name ? `Hi ${name},` : "Hello,"}

We received a request to reset your password. Use the OTP code below to verify your identity:

OTP: ${otp}

This OTP will expire in 15 minutes.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

Security Tip: Never share your OTP with anyone. JobSphere will never ask for your OTP via phone or email.

---
This is an automated email, please do not reply.
© ${new Date().getFullYear()} JobSphere. All rights reserved.
    `,
	};

	await nodemailerTransporter.sendMail(mailOptions);
}
