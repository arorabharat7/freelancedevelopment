import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Profile from '../../../models/Profile';

dbConnect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ success: false, message: 'User ID is required.' });
    return;
  }

  try {
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found.' });
      return;
    }

    profile.profileVerified = true;
    await profile.save();

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Error in verify-profile handler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
