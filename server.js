const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const app = express();

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dyctunopr',
  api_key: '828774135796583',
  api_secret: '8wnZs1xL8qcIVmOj5dW-DohPbBo'
});

// Set up Multer for handling image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Folder to temporarily store images before uploading to Cloudinary
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set a unique filename
  }
});

const upload = multer({ storage: storage });

// Route to handle image upload
app.post('/upload', upload.single('image'), (req, res) => {
  const imagePath = req.file.path; // Path to the uploaded image

  // Upload to Cloudinary
  cloudinary.uploader.upload(imagePath, { folder: 'your_folder_name' }, (err, result) => {
    if (err) {
      console.error('Error uploading image to Cloudinary:', err);
      return res.status(500).send('Error uploading image');
    }

    // After successful upload, delete the local file
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting local image file:', err);
      }
    });

    // Return the URL of the uploaded image
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
