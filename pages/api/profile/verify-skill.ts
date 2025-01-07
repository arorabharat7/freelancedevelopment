import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Profile from '../../../models/Profile';

interface Skill {
  skill: string;
  verified: boolean;
}

dbConnect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, skill } = req.body;

  if (!userId || !skill) {
    res.status(400).json({ success: false, message: 'User ID and skill are required.' });
    return;
  }

  try {
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found.' });
      return;
    }

    // Explicitly type 's' as a Skill
    const skillIndex = profile.skills.findIndex((s: Skill) => s.skill === skill);
    if (skillIndex === -1) {
      res.status(400).json({ success: false, message: 'Skill not found.' });
      return;
    }

    profile.skills[skillIndex].verified = true;
    await profile.save();

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Error in verify-skill handler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
