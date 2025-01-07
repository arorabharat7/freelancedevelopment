import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import BlogPost from '../../../models/BlogPost';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const post = await BlogPost.findOne({ slug });
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json(post);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).json({ message: 'Failed to load blog post' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { featuredImage, ...otherFields } = req.body; // Extract featuredImage and other fields
  
      // Update the blog post with specific fields
      const updatedPost = await BlogPost.findOneAndUpdate(
        { slug },
        { $set: { ...otherFields, featuredImage } }, // Ensure to update featuredImage separately
        { new: true, runValidators: true }
      );
  
      if (!updatedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ message: 'Failed to update blog post' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;
