const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Set up Multer for handling image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);  // Save images to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filenames
  }
});

const upload = multer({ storage: storage }).single('image');

// Route to handle image upload
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Error during upload:', err);
      return res.status(500).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = req.file.path;  // Path to the uploaded image

    // Upload image to Cloudinary
    cloudinary.uploader.upload(imagePath, { folder: 'your_folder_name' }, (err, result) => {
      if (err) {
        console.error('Error uploading image to Cloudinary:', err);
        return res.status(500).json({ message: 'Cloudinary upload error' });
      }

      console.log('Image uploaded to Cloudinary:', result.secure_url);

      // No file deletion here, keeping the local copy
      res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl: result.secure_url,  // Cloudinary URL
        localFilePath: imagePath      // Path to local image
      });
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
