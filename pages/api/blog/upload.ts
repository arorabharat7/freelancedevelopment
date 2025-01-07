import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parser to use formidable
  },
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = formidable({ multiples: false }); // Single file upload

  // Wrap form.parse in a Promise to use async/await
  const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> =>
    new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

  try {
    const { fields, files } = await parseForm(req);

    // Ensure a file is present in the request
    if (!files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    try {
      // Upload the file to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.filepath, {
        folder: 'feature-images', // Storing under 'feature-images' folder
      });

      // Return the Cloudinary URL of the uploaded image
      return res.status(200).json({ success: true, url: uploadResult.secure_url });
    } catch (uploadError) {
      console.error('Cloudinary upload failed:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
  } catch (outerError) {
    console.error('Error parsing form or handling upload:', outerError);
    return res.status(500).json({ error: 'Failed to process request' });
  }
};

export default handler;
