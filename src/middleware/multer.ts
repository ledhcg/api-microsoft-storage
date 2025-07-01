import multer from "multer";
import { allowedMimeTypes, documentTypes, fileSizeLimits } from "../config/multer";

// General file upload configuration
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: fileSizeLimits.general,
  },
  fileFilter: (req, file, cb) => {
    // Check if file type is allowed
    if (allowedMimeTypes[file.mimetype as keyof typeof allowedMimeTypes]) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error(`File type ${file.mimetype} is not supported. Allowed types: ${Object.keys(allowedMimeTypes).join(', ')}`));
    }
  },
});

// Image upload configuration
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: fileSizeLimits.image,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error('Only image files are allowed for this endpoint!'));
    }
  },
});

// Document upload configuration
export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: fileSizeLimits.document,
  },
  fileFilter: (req, file, cb) => {
    if (documentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error('Only document files are allowed for this endpoint!'));
    }
  },
});

// Video upload configuration
export const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: fileSizeLimits.video,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error('Only video files are allowed for this endpoint!'));
    }
  },
});