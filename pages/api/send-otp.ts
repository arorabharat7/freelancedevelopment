// pages/api/send-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Profile from '../../models/Profile'; // Adjust the path as needed
import dbConnect from '../../utils/db';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch'; // You might need to install this if not available

// Ensure these environment variables are set in your .env.local or deployment configuration
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN as string;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID as string;
const jwtSecret = process.env.JWT_SECRET as string;

// Ensure the database connection is established
dbConnect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mobileNumber } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.split(' ')[1] : undefined;

  if (!mobileNumber) {
    return res.status(400).json({ success: false, error: 'Mobile number is required.' });
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authorization token is required.' });
  }

  if (!jwtSecret || !accessToken || !phoneNumberId) {
    return res.status(500).json({ success: false, error: 'Server configuration error.' });
  }

  try {
    // Verify the JWT token
    const decodedToken = jwt.verify(token, jwtSecret) as { userId: string };
    const userId = decodedToken.userId;
    console.log('Decoded userId:', userId);

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if a profile with the userId already exists or create a new one
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { mobileNumber, otp }, // Update mobile number and OTP
      { new: true, upsert: true } // Create a new profile if not found
    );

    if (!profile) {
      throw new Error('Profile not found or OTP could not be saved.');
    }

    // Send OTP via WhatsApp API
    const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: mobileNumber,
        type: 'template',
        template: {
          name: 'otp_template', // Make sure this template exists in your WhatsApp Business account
          language: {
            code: 'en_US'
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: otp
                }
              ]
            },
            {
              type: 'button',
              sub_type: 'url',
              index: 0,
              parameters: [
                {
                  type: 'text',
                  text: otp
                }
              ]
            }
          ]
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error response from WhatsApp API:', data);
      throw new Error('Failed to send OTP: ' + JSON.stringify(data));
    }

    console.log('OTP sent successfully:', data);
    res.status(200).json({ success: true, message: "OTP sent successfully", otp }); // Optionally return OTP for testing
  } catch (error) {
    console.error('Error in send-otp handler:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
