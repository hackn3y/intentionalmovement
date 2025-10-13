const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure storage for local development
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine upload directory based on file type or request path
    let uploadDir = 'uploads/';

    if (req.path.includes('/profile')) {
      uploadDir += 'profiles/';
    } else if (req.path.includes('/program')) {
      uploadDir += 'programs/';
    } else if (req.path.includes('/post')) {
      uploadDir += 'posts/';
    } else {
      uploadDir += 'general/';
    }

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
const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
});

const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
});

const uploadAny = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for general files
  }
});

module.exports = {
  uploadImage,
  uploadVideo,
  uploadAny,
  storage
};
