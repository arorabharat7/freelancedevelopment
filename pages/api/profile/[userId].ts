// api/profile/[userId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Profile from '../../../models/Profile'; 

dbConnect();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId } = req.query;

  try {
    const profile = await Profile.findOne({ userId }); 

    if (!profile) {
      console.error('Profile not found for userId:', userId);
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    // const mobileNumberVerified = await isVerified(profile.mobileNumber);

    res.status(200).json({ ...profile.toObject(),  });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export default handler;
