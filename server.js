const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();

// Middleware to parse incoming request body
app.use(bodyParser.json({ limit: '10mb' }));

// Save image to local folder
app.post('/upload', (req, res) => {
    const imageData = req.body.image; // Base64 encoded image
    const base64Data = imageData.replace(/^data:image\/png;base64,/, ""); // Remove the base64 prefix
    const filename = `captured_image_${Date.now()}.png`;

    // Save the image locally
    const imagesPath = path.join(__dirname, 'images');
    if (!fs.existsSync(imagesPath)) {
        fs.mkdirSync(imagesPath);
    }

    fs.writeFile(path.join(imagesPath, filename), base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving image:', err);
            return res.status(500).send('Error saving image');
        }

        console.log('Image saved locally. Now pushing to GitHub...');

        // Commit the image to GitHub repository using shell command
        exec(`git add images/${filename} && git commit -m "Add image ${filename}" && git push`, (err, stdout, stderr) => {
            if (err) {
                console.error('Error pushing to GitHub:', err);
                return res.status(500).send('Error pushing image to GitHub');
            }

            console.log('Image pushed to GitHub');
            const publicUrl = `https://raw.githubusercontent.com/your-username/your-repository/main/images/${filename}`;
            res.status(200).send(`Image uploaded successfully: ${publicUrl}`);
        });
    });
});

// Listening on port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
