import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Profile from '../../../models/Profile';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find the profile to get the image URL
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profileImage = profile.profileImage;
    if (!profileImage) {
      return res.status(400).json({ error: 'No profile image found to delete' });
    }

    // Extract the public ID from the Cloudinary image URL
    const publicId = profileImage.split('/').pop()?.split('.')[0];

    if (!publicId) {
      return res.status(400).json({ error: 'Invalid image URL' });
    }

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(`profiles/${publicId}`);
    if (result.result !== 'ok') {
      console.error('Failed to delete image from Cloudinary:', result);
      return res.status(500).json({ error: 'Failed to delete image from Cloudinary' });
    }

    // Update the profile to remove the profileImage reference
    profile.profileImage = '';
    await profile.save();

    console.log('Image deleted and profile updated successfully for userId:', userId);
    return res.status(200).json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Failed to delete image for userId:', error);
    return res.status(500).json({ error: 'Failed to delete image' });
  }
};

export default handler;
