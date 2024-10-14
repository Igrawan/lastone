const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Limit the size of the body to avoid issues

// Endpoint to receive the image data
app.post('/upload', (req, res) => {
    const imageData = req.body.image;

    // Remove the data URL prefix to get just the base64 string
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");

    // Write the image to a file (optional: you could send it to a database)
    fs.writeFile('captured_image.png', base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving image:', err);
            return res.status(500).send('Error saving image');
        }
        console.log('Image saved successfully');
        res.status(200).send('Image received');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
