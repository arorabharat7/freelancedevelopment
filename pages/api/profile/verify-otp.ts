// pages/api/profile/verify-otp.ts

import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Profile from '../../../models/Profile';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // Connect to the database

  if (req.method === 'POST') {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
      return res.status(400).json({ error: 'Mobile number and OTP are required' });
    }

    try {
      const isVerified = await verifyOtp(mobileNumber, otp);
      if (isVerified) {
        return res.status(200).json({ success: true, message: 'OTP verified successfully' });
      } else {
        return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export const verifyOtp = async (mobileNumber: string, otp: string): Promise<boolean> => {
  try {
    // Retrieve the profile using the mobile number
    const profile = await Profile.findOne({ mobileNumber });

    // Check if profile and OTP match
    if (profile && profile.otp === otp) {
      // Mark mobile number as verified
      await Profile.updateOne(
        { mobileNumber },
        { mobileNumberVerified: true, otp: null }
      );

      return true;
    }
    return false;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};
