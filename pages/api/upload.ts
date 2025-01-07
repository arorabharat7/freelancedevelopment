// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import formidable, { File as FormidableFile } from 'formidable';
import { promises as fs } from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadFile = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = formidable({
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    multiples: false,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form:', err);
      res.status(500).json({ error: 'Failed to upload file' });
      return;
    }

    const file = files.file as FormidableFile | FormidableFile[];

    try {
      const uploadPromises = (Array.isArray(file) ? file : [file]).map(async (f) => {
        const result = await cloudinary.uploader.upload(f.filepath, {
          resource_type: 'auto',
        });
        await fs.unlink(f.filepath); // Remove the temporary file
        return result.secure_url;
      });

      const urls = await Promise.all(uploadPromises);
      res.status(200).json({ urls });
    } catch (error) {
      console.error('Failed to upload image to Cloudinary:', error);
      res.status(500).json({ error: (error as any).message });
    }
  });
};

export default uploadFile;
