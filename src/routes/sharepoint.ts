import { Router } from "express";
import { UploadController } from "../controllers/UploadController";
import { upload, imageUpload, documentUpload, videoUpload } from "../middleware/multer";

const router = Router();
const uploadController = new UploadController();

// SharePoint/Organizational OneDrive upload routes
// Image upload to organizational drive
router.post("/image", imageUpload.single("image"), (req, res) =>
  uploadController.uploadImage(req, res)
);

// Generic file upload to organizational drive
router.post("/file", upload.single("file"), (req, res) =>
  uploadController.uploadFile(req, res)
);

// Document upload to organizational drive
router.post("/document", documentUpload.single("document"), (req, res) =>
  uploadController.uploadDocument(req, res)
);

// Video upload to organizational drive
router.post("/video", videoUpload.single("video"), (req, res) =>
  uploadController.uploadVideo(req, res)
);

export default router;