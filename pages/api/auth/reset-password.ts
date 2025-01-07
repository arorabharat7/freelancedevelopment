// pages/api/auth/reset-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

const resetPasswordHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    console.error('Missing token or newPassword');
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  try {
    console.log('Token from request:', token);

    if (newPassword.length < 8) {
      console.error('Password too short');
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Find the user by the reset password token
    const user = await User.findOne({ resetPasswordToken: token });
    console.log('User found:', user ? user._id : 'No user found');

    if (!user) {
      console.error('User not found for the given token');
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash the new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = ''; // Clear the token after successful reset
    await user.save();

    console.log('Password reset successful for user:', user._id);
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

export default resetPasswordHandler;
