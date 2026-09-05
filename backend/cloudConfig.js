const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const cloudName = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUD_API_KEY || process.env.CLOUDINARY_KEY;
const apiSecret = process.env.CLOUD_API_SECRET || process.env.CLOUDINARY_SECRET;

const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

let upload;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'fairstay_dev',
      allowed_formats: ['png', 'jpg', 'jpeg', 'webp'],
    },
  });

  upload = multer({ storage });
} else {
  // Ensure local uploads directory exists
  const localUploadDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(localUploadDir)) {
    fs.mkdirSync(localUploadDir, { recursive: true });
  }

  const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, localUploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  upload = multer({ storage: localStorage });
}

module.exports = {
  cloudinary,
  upload,
  isCloudinaryConfigured,
};
