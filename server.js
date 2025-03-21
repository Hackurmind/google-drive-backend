const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS to allow frontend requests
app.use(cors());

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Load Google Drive API credentials
const auth = new google.auth.GoogleAuth({
    keyFile: "drive-key.json", // 🔹 Upload this to Railway
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

// Upload file to Google Drive
async function uploadToDrive(filePath, fileName) {
    const fileMetadata = {
        name: fileName,
        parents: ["15OXralkhdg-eAZ4f3fUwi9-D3J0-iaUH"], // Replace with your Google Drive Folder ID
    };

    const media = {
        mimeType: "application/pdf",
        body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id",
    });

    console.log("Uploaded File ID:", response.data.id);
    return response.data.id;
}

// Handle file uploads
app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    try {
        const fileId = await uploadToDrive(req.file.path, req.file.originalname);
        res.json({ message: "File uploaded successfully!", fileId });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).send("Upload failed.");
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
