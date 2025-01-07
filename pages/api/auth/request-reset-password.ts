// pages/api/auth/request-reset-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import User from '../../../models/User';
import { sendResetPasswordEmail } from '../../../utils/email';
import crypto from 'crypto';

const requestResetPasswordHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    // Save the reset token to the user document
    user.resetPasswordToken = resetToken;
    await user.save();

    await sendResetPasswordEmail(email, resetToken);

    console.log(`Password reset email sent to ${email} with token ${resetToken}`);
    res.status(200).json({ message: 'Password reset token sent to email' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
};

export default requestResetPasswordHandler;
