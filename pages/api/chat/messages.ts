import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '../../../utils/db'; // Connect to your database

// Define the message handler
const messagesHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Ensure the database is connected
  await dbConnect();

  if (req.method === 'GET') {
    const { userId, chatUserId } = req.query;

    if (!userId || !chatUserId) {
      return res.status(400).json({ error: 'Missing userId or chatUserId' });
    }

    try {
      // Use TypeScript's type assertion to avoid errors with Mongoose typing
      const messages = await (mongoose.connection as any).db
        .collection('messages')
        .find({
          $or: [
            { senderId: userId, receiverId: chatUserId },
            { senderId: chatUserId, receiverId: userId },
          ],
        })
        .sort({ timestamp: 1 }) // Sort by timestamp, if needed
        .toArray();

      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  } else if (req.method === 'POST') {
    const { user1, user2, message } = req.body;

    if (!user1 || !user2 || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const newMessage = {
        senderId: user1,
        receiverId: user2,
        content: message.content,
        timestamp: new Date(),
      };

      // Insert the new message into the messages collection
      await (mongoose.connection as any).db.collection('messages').insertOne(newMessage);

      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Export the handler function as the default export
export default messagesHandler;
