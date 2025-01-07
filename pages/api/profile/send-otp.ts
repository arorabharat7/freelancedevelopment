import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import Profile from '../../../models/Profile';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received request:', req.body);

  await dbConnect(); // Ensure connection inside handler

  const { userId } = req.body;
  if (!userId) {
    console.log('User ID is missing.');
    res.status(400).json({ success: false, message: 'User ID is required.' });
    return;
  }

  try {
    // Find the user profile by userId
    console.log('Connecting to the database...');
    const profile = await Profile.findOne({ userId });
    console.log('Profile found:', profile);

    if (!profile) {
      console.log('Profile not found for userId:', userId);
      res.status(404).json({ success: false, message: 'Profile not found.' });
      return;
    }

    const { mobileNumber } = profile;

    if (!mobileNumber || mobileNumber.trim() === '') {
      console.log('Mobile number is missing in profile.');
      res.status(400).json({ success: false, message: 'Mobile number not found in profile.' });
      return;
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);

    // Get access token and phone number ID from environment variables
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN as string;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID as string;

    if (!accessToken || !phoneNumberId) {
      console.log('WhatsApp API credentials are not set.');
      res.status(500).json({ success: false, message: 'WhatsApp API credentials not set.' });
      return;
    }

    console.log('Sending OTP via WhatsApp API...');
    // Send OTP via WhatsApp API
    const otpSent = await sendOtp(mobileNumber, otp, accessToken, phoneNumberId);

    if (!otpSent) {
      console.log('Failed to send OTP.');
      res.status(500).json({ success: false, message: 'Failed to send OTP.' });
      return;
    }

    // Optionally, save the OTP to your database for verification later
    console.log('Logging OTP in the database...');
    await Profile.updateOne(
      { userId },
      { $set: { otp } },
      { upsert: true }
    );

    console.log('OTP sent and logged successfully.');
    res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Error in send-otp handler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}

interface WhatsAppApiResponse {
  error?: {
    message: string;
  };
  // You can add more fields based on the actual response structure
}

export const sendOtp = async (
  mobileNumber: string,
  otp: string,
  accessToken: string,
  phoneNumberId: string
): Promise<boolean> => {
  try {
    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: mobileNumber,
        type: 'template',
        template: {
          name: 'otp_template', // Make sure this template exists in your WhatsApp Business account
          language: {
            code: 'en_US',
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: otp,
                },
              ],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: 0,
              parameters: [
                {
                  type: 'text',
                  text: otp,
                },
              ],
            },
          ],
        },
      }),
    });

    const data = await response.json() as WhatsAppApiResponse;
    console.log('WhatsApp API response:', data);

    if (!response.ok && data.error) {
      console.log('Failed to send OTP:', data.error.message);
      return false;
    }

    console.log(`Sending OTP ${otp} to ${mobileNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};
