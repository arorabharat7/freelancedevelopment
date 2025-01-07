// pages/api/admin/check.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import { verifyAdmin } from '../../../utils/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();
  // console.log('Request received for admin check');

  const isAdmin = verifyAdmin(req);
  console.log('Is Admin:', isAdmin);

  if (!isAdmin) {
    // console.log('Forbidden: User is not an admin');
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.status(200).json({ message: 'Admin verified' });
};

export default handler;
