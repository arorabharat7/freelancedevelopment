import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

export const verifyAdmin = (req: NextApiRequest) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.error('No token provided');
    return false;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, userType: string, email: string };
    console.log('Decoded JWT:', decoded);  // Debug the decoded JWT

    if (decoded.userType === 'admin') {
      (req as any).user = { email: decoded.email };  // Set req.user for future use if needed
      return true;
    } else {
      console.error('User is not an admin');
      return false;
    }
  } catch (error) {
    console.error('JWT verification failed:', error);
    return false;
  }
};
