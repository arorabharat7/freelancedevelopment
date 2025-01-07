import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../utils/db';
import jwt from 'jsonwebtoken';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect(); // Ensure the database is connected

  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    res.status(200).json({ message: 'This is a secure message', user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default handler;
