// pages/api/auth/confirm-email.ts

import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import User from '../../../models/User';
import Profile from '../../../models/Profile';
import jwt from 'jsonwebtoken';

const confirmEmailHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  const { token } = req.query; // Use query parameter to find token
  console.log('Received token for confirmation:', token);

  if (!token || typeof token !== 'string') {
    console.error('Invalid or missing token');
    return res.status(400).json({ error: 'Invalid or missing token' });
  }

  try {
    const user = await User.findOne({ verificationToken: token });
    console.log('User lookup result:', user);

    if (!user) {
      return res.status(404).json({ error: 'Invalid or expired token' });
    }

    if (user.emailConfirmed) {
      return res.status(400).json({ error: 'Email is already confirmed' });
    }

    // Update user status to confirmed
    user.emailConfirmed = true;
    user.verificationToken = undefined; // Safely clear the token
    await user.save();

    // Create or update profile
    const profile = await Profile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        fullName: '',
        mobileNumber: '',
        otp: '',
      },

      { new: true, upsert: true } // Create if doesn't exist
    );

    // Generate a JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    const authToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

    console.log('User email confirmed:', user);
    res.status(200).json({ message: 'Email confirmed successfully', token: authToken, userId: user._id });
  } catch (error) {
    console.error('Error during email confirmation:', error);
    res.status(500).json({ error: 'Email confirmation failed' });
  }
};

export default confirmEmailHandler;
