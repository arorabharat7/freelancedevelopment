import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import User from '../../../models/User';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  const { page = 1, search = '' } = req.query;
  const limit = 10; // Number of users per page
  const skip = (parseInt(page as string) - 1) * limit;

  const searchQuery = search
    ? { 'profile.skills.skill': { $regex: search, $options: 'i' } }
    : {};

  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'profiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile',
        },
      },
      { $unwind: {
          path: '$profile',
          preserveNullAndEmptyArrays: true  // Allow users without profiles
      }},
      {
        $match: { ...searchQuery, userType: 'freelancer' }, // Ensure only freelancers are returned
      },
      {
        $project: {
          email: 1,
          'profile.fullName': 1,
          'profile.mobileNumber': 1,
          'profile.profileImage': 1,
          'profile.skills': 1,
          'profile.portfolioLinks': 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    console.log('Fetched users:', users);  // Debug line to verify users fetched

    if (users.length === 0) {
      console.log('No users found for the given search criteria or page.');
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export default handler;
