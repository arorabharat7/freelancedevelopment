import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import BlogPost from '../../../models/BlogPost';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  try {
    const posts = await BlogPost.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
};

export default handler;
