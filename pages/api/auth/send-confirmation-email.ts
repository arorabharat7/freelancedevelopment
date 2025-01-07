// utils/send-confirmation-email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT as string, 10),
  secure: true, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_USER_PASSWORD,
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} with OTP ${otp}`);
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

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Please use the following link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to} with token ${token}`);
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

export const sendConfirmationEmail = async (to: string, token: string) => {
  const confirmLink = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: 'Confirm Your Email Address',
    text: `Please confirm your email address by clicking the following link: ${confirmLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${to} with token ${token}`);
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

export const sendProfileVerificationRequestEmail = async (to: string, email: string) => {
  // Debugging SMTP credentials
  console.log('SMTP User:', process.env.SMTP_USER);
  console.log('SMTP Password:', process.env.SMTP_PASS ? 'Exists' : 'Missing');

  const mailOptions = {
    from: process.env.SMTP_USER, // Ensure from address is consistent
    to,
    subject: 'Profile Verification Request', // Correct the subject
    text: `Dear Admin, \n\nUser ${email} has requested profile verification. Please review the profile and take the necessary action.`, // Proper text body
  };

  // Trying different transporter configurations for testing
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465, // Test with port 587 for TLS
    secure: true, // TLS configuration
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Optional for self-signed certificates
    },
  });

  try {
    await transporter.sendMail(mailOptions); 
    console.log(`Profile verification email sent to ${to}`);
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


// **New Function** to send skill verification request email
export const sendSkillVerificationRequestEmail = async (to: string, email: string, skillName: string) => {
  // Debugging SMTP credentials
  console.log('SMTP User:', process.env.SMTP_USER);
  console.log('SMTP Password Exists:', process.env.SMTP_PASS ? 'Yes' : 'No');

  // Validate recipient email address
  if (!to || to.trim() === '') {
      throw new Error('Recipient email address is not defined or is empty.');
  }

  const mailOptions = {
      from: process.env.SMTP_USER, // Ensure from address is consistent
      to,
      subject: 'Skill Verification Request',
      text: `Dear Admin, \n\nUser ${email} has requested verification for the skill: ${skillName}. Please review the request and take the necessary action.`,
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log(`Skill verification email sent to ${to} for skill: ${skillName}`);
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


 