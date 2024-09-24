const express = require('express');
const multer = require('multer');
const path = require('path');
const { processImage, processAudio, processVideo } = require('../utils/mediaProcessing');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileType = req.file.mimetype.split('/')[0];
  let processedFile;

  try {
    switch (fileType) {
      case 'image':
        processedFile = await processImage(req.file.path);
        break;
      case 'audio':
        processedFile = await processAudio(req.file.path);
        break;
      case 'video':
        processedFile = await processVideo(req.file.path);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Simulate AI analysis (random result)
    const isDeepfake = Math.random() < 0.5;

    res.json({ isDeepfake, processedFile });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
});

module.exports = router;