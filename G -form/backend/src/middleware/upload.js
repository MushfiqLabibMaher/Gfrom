const multer = require('multer');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;  // 10 MB
const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30 MB

// Use memory storage so we can pipe directly to Supabase
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    // multer uses the larger limit; per-field size is validated in the route
    fileSize: MAX_VIDEO_SIZE,
  },
});

module.exports = { upload, ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_PHOTO_SIZE, MAX_VIDEO_SIZE };
