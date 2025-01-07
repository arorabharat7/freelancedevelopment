import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import BlogPost from '../../../models/BlogPost';
import User from '../../../models/User'; // Import User model
import { verifyAdmin } from '../../../utils/auth';
import { validateBlogPost } from '../../../utils/validators';
import jwt from 'jsonwebtoken';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === 'POST') {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.error('No token provided');
      return res.status(403).json({ message: 'Forbidden: No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; userType: string; email: string };
      console.log('Decoded JWT:', decoded); // Debug the decoded JWT

      if (decoded.userType !== 'admin') {
        console.error('User is not an admin');
        return res.status(403).json({ message: 'Forbidden: User is not an admin' });
      }

      if (!decoded.email) {
        throw new Error('JWT does not contain email');
      }
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      console.error('JWT verification failed:', errorMessage);
      return res.status(403).json({ message: 'Forbidden: Invalid token or missing email' });
    }

    const userEmail = decoded.email;

    try {
      // Specify the type of user
      const user = await User.findOne({ email: userEmail }).lean<{ _id: string }>();
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const author = user._id; // Use ObjectId of the user
      console.log('Author ObjectId set to:', author); // Debugging

      const {
        title,
        content,
        categories,
        tags,
        featuredImage,
        seo,
        metaDescription,
        authorBio,
        altText,
        references,
        status,
      } = req.body;

      // Remove empty values from tags array if any
      const filteredTags = tags ? tags.filter((tag: string) => tag.trim() !== '') : [];

      const { error } = validateBlogPost({
        ...req.body,
        tags: filteredTags,
      });

      if (error) {
        console.log('Validation Error:', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }

      const newPost = new BlogPost({
        title,
        content,
        categories,
        tags: filteredTags,
        featuredImage,
        seo,
        author,
        metaDescription,
        authorBio,
        altText,
        references,
        status,
      });
      console.log('New Post Data:', newPost); // Debugging
      await newPost.save();
      res.status(201).json(newPost);
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      console.error('Failed to create blog post:', errorMessage);
      res.status(500).json({ error: 'Failed to create blog post' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;
