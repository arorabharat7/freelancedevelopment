// pages/api/auth/verify-otp.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import User from '../../../models/User';
import Profile from '../../../models/Profile';
import { get, destroy } from '../../../utils/session-store';
import jwt from 'jsonwebtoken';

const verifyOtpHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  const { email, otp } = req.body;

  console.log('Request Body:', req.body);

  if (!email || !otp) {
    console.log('Missing email or OTP');
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    const storedOtp = await get(req, res, 'otp');
    const hashedPassword = await get(req, res, 'hashedPassword');
    const userType = await get(req, res, 'userType');

    console.log('Stored OTP:', storedOtp);
    console.log('Stored Hashed Password:', hashedPassword);
    console.log('Stored User Type:', userType);

    if (!storedOtp || !hashedPassword || !userType) {
      console.log('Missing session data');
      return res.status(400).json({ error: 'OTP session data is missing' });
    }

    if (otp !== storedOtp) {
      console.log('Invalid OTP');
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({ email, password: hashedPassword, userType });
    await user.save();

    const profile = new Profile({
      userId: user._id,
      bio: '',
      portfolioLinks: []
    });
    await profile.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    // Clear session data after successful registration
    await destroy(req, res);

    res.status(201).json({ message: 'User registered successfully', token, userId: user._id });
  } catch (error) {
    console.error('Error during OTP verification:', error);
    const err = error as Error;
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

export default verifyOtpHandler;
