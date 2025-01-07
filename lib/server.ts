// lib/server.ts
import express, { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set storage engine
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: (req, file, cb: FileFilterCallback) => {
    checkFileType(file, cb);
  },
}).single('image');

// Check file type
function checkFileType(file: Express.Multer.File, cb: FileFilterCallback) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
}

// Upload endpoint
app.post('/upload', (req: Request, res: Response) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({ message: err.message });
    } else {
      if (req.file == undefined) {
        res.status(400).json({ message: 'No file selected!' });
      } else {
        res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
      }
    }
  });
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
