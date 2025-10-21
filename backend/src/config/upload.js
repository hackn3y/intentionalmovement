const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Configure memory storage for S3 uploads
const memoryStorage = multer.memoryStorage();

// Configure storage for local development
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine upload directory based on file type or request path
    // Use absolute path relative to project root
    const baseDir = path.join(__dirname, '../../uploads/');
    let uploadDir = baseDir;

    if (req.path.includes('/profile')) {
      uploadDir = path.join(baseDir, 'profiles/');
    } else if (req.path.includes('/program')) {
      uploadDir = path.join(baseDir, 'programs/');
    } else if (req.path.includes('/post')) {
      uploadDir = path.join(baseDir, 'posts/');
    } else {
      uploadDir = path.join(baseDir, 'general/');
    }

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('[Upload] Created directory:', uploadDir);
    }

    console.log('[Upload] Saving file to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'), false);
  }
};

// File filter for videos
const videoFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, MPEG, MOV and WebM videos are allowed.'), false);
  }
};

// Upload middleware configurations
// Use memory storage for S3 uploads when STORAGE_MODE=s3
const useS3 = process.env.STORAGE_MODE === 's3';
const storageToUse = useS3 ? memoryStorage : storage;

const uploadImage = multer({
  storage: storageToUse,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
});

const uploadVideo = multer({
  storage: storageToUse,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
});

const uploadAny = multer({
  storage: storageToUse,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for general files
  }
});

module.exports = {
  uploadImage,
  uploadVideo,
  uploadAny,
  storage,
  memoryStorage,
  useS3
};
