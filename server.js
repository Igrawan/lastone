const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse incoming request body
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit if needed

// Create 'images' folder if it doesn't exist
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Serve static files from 'images' folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// Upload route to save the image
app.post('/upload', (req, res) => {
    const imageData = req.body.image; // Base64 encoded image
    const base64Data = imageData.replace(/^data:image\/png;base64,/, ""); // Remove the base64 prefix
    
    // Create a unique filename using timestamp
    const filename = `captured_image_${Date.now()}.png`;

    // Save the image in the 'images' folder
    fs.writeFile(path.join(imagesDir, filename), base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving image:', err);
            return res.status(500).send('Error saving image');
        }
        console.log('Image saved successfully');
        res.status(200).send(`Image saved successfully: /images/${filename}`);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
