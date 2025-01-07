import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Profile from '../../../models/Profile';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parser to use formidable
  },
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  const form = formidable({ multiples: true }); // Allow multiple file uploads

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form:', err);
      return res.status(500).json({ error: 'Failed to process form data' });
    }

    console.log('Parsed fields:', fields);

    const userId = fields.userId ? fields.userId.toString() : null;
    const fullName = fields.fullName ? fields.fullName.toString() : '';
    const bio = fields.bio ? fields.bio.toString() : '';
    const skills = fields.skills
      ? fields.skills.toString().split(',').map((skill) => ({ skill, verified: false }))
      : [];
    const portfolioLinks = fields.portfolioLinks ? fields.portfolioLinks.toString().split(',') : [];
    const mobileNumber = fields.mobileNumber ? fields.mobileNumber.toString() : null;

    if (!userId) {
      console.error('Invalid userId:', userId);
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    try {
      // Handle profile image upload
      let profileImageUrl = fields.profileImage ? fields.profileImage.toString() : '';

      if (files.file) {
        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        // Upload the file to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.filepath, {
          folder: 'profiles',
        });

        profileImageUrl = uploadResult.secure_url;
      }

      // Retrieve the current profile to compare the mobile number
      const currentProfile = await Profile.findOne({ userId });

      // Determine if the mobile number has changed or is blank
      const mobileNumberChanged = currentProfile && currentProfile.mobileNumber !== mobileNumber;
      const shouldInvalidateMobileNumber = mobileNumberChanged || !mobileNumber;

      // Check if the mobile number is already associated with another profile
      if (mobileNumber) {
        const existingProfileWithMobile = await Profile.findOne({
          mobileNumber,
          userId: { $ne: userId },
        });
        if (existingProfileWithMobile) {
          console.error('Mobile number is already associated with another profile:', mobileNumber);
          return res.status(400).json({ error: 'Mobile number is already associated with another profile' });
        }
      }

      // Update the profile with the provided data
      console.log('Updating profile for userId:', userId);
      const profile = await Profile.findOneAndUpdate(
        { userId },
        {
          fullName: fullName || '',
          bio: bio || '',
          skills: skills || [],
          portfolioLinks: portfolioLinks || [],
          mobileNumber: mobileNumber || '',
          profileImage: profileImageUrl || '',
          mobileNumberVerified: shouldInvalidateMobileNumber ? false : currentProfile?.mobileNumberVerified,
        },
        { new: true, upsert: true }
      );

      console.log('Profile updated successfully for userId:', userId);
      return res.status(200).json({ success: true, profile });
    } catch (error) {
      console.error('Failed to update profile for userId:', userId, 'Error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  });
};

export default handler;
