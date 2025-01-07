import { NextApiRequest, NextApiResponse } from 'next';
import User from './../../../models/User'; // Use default import
import Profile from '@/models/Profile';
import { sendProfileVerificationRequestEmail } from './../auth/send-confirmation-email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = req.body; // Destructure only once
  
    console.log('Received request for userId:', userId); // Debug 1: Log the userId received in the request

    try {
      // Fetch user data from database using userId
      const profile = await Profile.findById(userId); // Profile data
      const user = await User.findById(userId); // Fetch user from database
      
      console.log('Profile Object:', profile); // Debug 2: Log profile data after fetching
      console.log('User Object:', user); // Debug 3: Log user data after fetching

      if (!user) {
        console.error('User not found for userId:', userId); // Debug 4: Log if user is not found
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Get admin email from environment variables
      const adminEmail: string | undefined = process.env.ADMIN_EMAIL;
      console.log('Admin Email:', adminEmail); // Debug 5: Log admin email from environment variables
  
      // Handle case where adminEmail is undefined
      if (!adminEmail) {
        console.error('Admin email is not configured in environment variables'); // Debug 6: Log if adminEmail is missing
        return res.status(500).json({ message: 'Admin email is not configured.' });
      }
  
      // Send email to admin with the user's info
      console.log('Sending profile verification request email to admin...'); // Debug 7: Log before sending email
      await sendProfileVerificationRequestEmail(
        adminEmail,
        user.email ?? 'N/A', // Full name of the user (fallback if undefined)
      );
      console.log('Email sent to admin for user:', user.email); // Debug 8: Log successful email sending
  
      res.status(200).json({ message: 'Profile verification request sent to admin.' });
    } catch (error) {
      console.error('Error sending profile verification request:', error); // Debug 9: Log any errors during execution
      res.status(500).json({ message: 'Failed to send verification request' });
    }
}
