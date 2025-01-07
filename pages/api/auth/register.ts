// pages/api/auth/register.ts

import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '../../../models/User';
import { sendConfirmationEmail } from '../../../utils/email';

const registerHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Attempting to connect to DB');
  await dbConnect();
  console.log('Database connected');

  const { email, password, userType } = req.body;
  console.log('Received request data:', { email, userType });

  if (!email || !password || !userType) {
    console.log('Missing fields in the request');
    return res.status(400).json({ error: 'Email, password, and user type are required' });
  }

  console.log('Checking if the email is already registered');
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log('Email is already registered:', email);
    return res.status(400).json({ error: 'Email is already registered' });
  }

  console.log('Hashing the password');
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Password hashed');

  console.log('Generating verification token');
  const verificationToken = uuidv4();
  console.log('Generated verification token:', verificationToken);

  console.log('Creating new user');
  const user = new User({
    email,
    password: hashedPassword,
    userType,
    emailConfirmed: false,
    verificationToken
  });

  console.log('User object before saving:', user);

  try {
    await user.save();
    console.log('User saved with verification token:', user);

    console.log('Sending confirmation email');
    await sendConfirmationEmail(email, verificationToken);

    console.log('Verification email sent successfully');
    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export default registerHandler;
