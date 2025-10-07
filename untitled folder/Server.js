const express = require('express');
const multer = require('multer');
const heicConvert = require('heic-convert');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.single('heicfile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file was uploaded.');
  }

  try {
    const inputBuffer = fs.readFileSync(req.file.path);
    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.9
    });

    res.set({
      'Content-Disposition': 'attachment; filename="converted.jpg"',
      'Content-Type': 'image/jpeg',
    });
    res.send(outputBuffer);

  } catch (error) {
    console.error('Conversion failed:', error);
    res.status(500).send('Sorry, something went wrong during conversion.');
  } finally {
    fs.unlinkSync(req.file.path);
  }
});

app.listen(port, () => {
  console.log(`👍 Server is running! Open your browser and go to http://localhost:${port}`);
});
