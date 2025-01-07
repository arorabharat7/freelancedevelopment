// File: /api/profile/request-skill-verification.js
import { NextApiRequest, NextApiResponse } from 'next';
import User from '../../../models/User'; // Ensure correct relative path
import { sendSkillVerificationRequestEmail } from '../auth/send-confirmation-email'; // Adjust the path if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { userId, skill } = req.body;

    try {
        console.log('API Hit: request-skill-verification', userId, skill); // Debugging log

        // Fetch the user using userId
        const user = await User.findById(userId);

        // Check if user exists
        if (!user) {
            console.error('User not found for userId:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract user's email
        const userEmail = user.email;
        console.log('User Email:', userEmail); // Debugging log

        if (!userEmail || userEmail.trim() === '') {
            console.error('User email is missing or empty.');
            return res.status(400).json({ message: 'User email not found' });
        }

        // Ensure Admin Email is defined
        if (!process.env.ADMIN_EMAIL) {
            console.error('Admin email is not configured in environment variables.');
            return res.status(500).json({ message: 'Admin email not configured.' });
        }

        // Send skill verification request email
        await sendSkillVerificationRequestEmail(process.env.ADMIN_EMAIL, userEmail, skill);

        res.status(200).json({ message: `Verification request for '${skill}' sent.` });
    } catch (error) {
        console.error('Error in request-skill-verification:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
