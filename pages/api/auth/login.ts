// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const loginHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();  // Connect to the database

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find the user in the database by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check if the provided password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Create a JWT token with both userId and userType
    const token = jwt.sign(
      { id: user._id, userType: user.userType, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }  // Token expires in 1 hour
    );
  
    // Return the token and userId in the response
    res.status(200).json({ message: 'Login successful', token, userId: user._id });
    console.log('Token >>>>>', token);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export default loginHandler;
