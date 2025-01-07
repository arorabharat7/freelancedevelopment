import nodemailer from 'nodemailer';

// Helper function to get environment variables with type safety
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
}

// Configure the transporter using environment variables
const transporter = nodemailer.createTransport({
  host: getEnvVar('SMTP_HOST'),
  port: parseInt(getEnvVar('SMTP_PORT'), 10),
  secure: true, // Use SSL
  auth: {
    user: getEnvVar('SMTP_USER'),
    pass: getEnvVar('SMTP_PASS'),
  },
});

/**
 * Generic function to send an email.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} text - Text body of the email.
 * @param {string} html - HTML body of the email.
 */
const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  const mailOptions = {
    from: getEnvVar('SMTP_USER'),
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to send email:', error.message);
      if ((error as any).response) {
        console.error('SMTP Response:', (error as any).response);
      }
    } else {
      console.error('Failed to send email:', 'Unknown error');
    }
    throw new Error('Failed to send email');
  }
};

/**
 * Send an OTP email.
 * @param {string} to - Recipient email address.
 * @param {string} otp - The OTP code to send.
 */
export const sendOtpEmail = async (to: string, otp: string) => {
  const subject = 'Your OTP Code';
  const text = `Your OTP code is ${otp}. Please do not share it with anyone.`;
  const html = `
    <html>
    <body>
      <p>Your OTP code is <strong>${otp}</strong>. Please do not share it with anyone.</p>
    </body>
    </html>
  `;
  await sendEmail(to, subject, text, html);
};

/**
 * Send a password reset email.
 * @param {string} to - Recipient email address.
 * @param {string} token - The token for password reset.
 */
export const sendResetPasswordEmail = async (to: string, token: string) => {
  const resetLink = `${getEnvVar('FRONTEND_URL')}/reset-password?token=${token}`;
  const subject = 'Password Reset Request';
  const text = `Hello,

We received a request to reset your password. You can reset your password by clicking the link below:

${resetLink}

If you did not request this, please ignore this email.

Thank you,
Your Company Name`;

  const html = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #4CAF50;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. You can reset your password by clicking the link below:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 15px; margin: 10px 0; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thank you,<br>Freelance Development Agency</p>
      </div>
    </body>
    </html>
  `;
  await sendEmail(to, subject, text, html);
};

/**
 * Send an email confirmation.
 * @param {string} to - Recipient email address.
 * @param {string} token - The token for email confirmation.
 */
export const sendConfirmationEmail = async (to: string, token: string) => {
  const confirmationLink = `${getEnvVar('FRONTEND_URL')}/confirm-email?token=${token}`;
  const subject = 'Email Confirmation';
  const text = `Please confirm your email by clicking on the following link: ${confirmationLink}`;

  const html = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #4CAF50;">Email Confirmation</h2>
        <p>Hello,</p>
        <p>Please confirm your email address by clicking the link below:</p>
        <a href="${confirmationLink}" style="display: inline-block; padding: 10px 15px; margin: 10px 0; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Confirm Email</a>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thank you,<br>Freelance Development Agency</p>
      </div>
    </body>
    </html>
  `;
  await sendEmail(to, subject, text, html);
};
