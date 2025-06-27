import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import multer from "multer";
import { UploadController } from "./controllers/UploadController";
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
const app = express();
app.enable("trust proxy");
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());

// For Vercel serverless, we need to use memory storage instead of disk storage
// Define allowed file types
const allowedMimeTypes = {
  // Images
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/tiff': '.tiff',
  
  // Microsoft Office Documents
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  
  // PDF
  'application/pdf': '.pdf',
  
  // Videos
  'video/mp4': '.mp4',
  'video/avi': '.avi',
  'video/quicktime': '.mov',
  'video/x-msvideo': '.avi',
  'video/x-ms-wmv': '.wmv',
  'video/webm': '.webm',
  'video/ogg': '.ogv',
  'video/3gpp': '.3gp',
  'video/x-flv': '.flv',
  
  // Audio
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/aac': '.aac',
  'audio/x-m4a': '.m4a',
  
  // Text files
  'text/plain': '.txt',
  'text/csv': '.csv',
  'application/json': '.json',
  'application/xml': '.xml',
  
  // Archives
  'application/zip': '.zip',
  'application/x-rar-compressed': '.rar',
  'application/x-7z-compressed': '.7z'
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for larger files like videos
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

// Create separate upload configurations for different file types
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
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

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for documents
  },
  fileFilter: (req, file, cb) => {
    const documentTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/pdf',
      'text/plain',
      'text/csv'
    ];
    
    if (documentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error('Only document files are allowed for this endpoint!'));
    }
  },
});

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB for videos
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

const uploadController = new UploadController();

app.get("/", (_, res) => {
  res.json({
    message: "Hello, world!",
  });
});

// Image upload routes (backward compatibility)
app.post("/api/upload/image", imageUpload.single("image"), (req, res) =>
  uploadController.uploadImage(req, res)
);

app.post("/api/upload/personal", imageUpload.single("image"), (req, res) =>
  uploadController.uploadToPersonalDrive(req, res)
);

// Generic file upload routes (supports all file types)
app.post("/api/upload/file", upload.single("file"), (req, res) =>
  uploadController.uploadFile(req, res)
);

app.post("/api/upload/file/personal", upload.single("file"), (req, res) =>
  uploadController.uploadFileToPersonalDrive(req, res)
);

// Specific file type routes
app.post("/api/upload/document", documentUpload.single("document"), (req, res) =>
  uploadController.uploadDocument(req, res)
);

app.post("/api/upload/document/personal", documentUpload.single("document"), (req, res) =>
  uploadController.uploadDocumentToPersonalDrive(req, res)
);

app.post("/api/upload/video", videoUpload.single("video"), (req, res) =>
  uploadController.uploadVideo(req, res)
);

app.post("/api/upload/video/personal", videoUpload.single("video"), (req, res) =>
  uploadController.uploadVideoToPersonalDrive(req, res)
);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 9000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;
