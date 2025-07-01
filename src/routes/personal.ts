import { Router } from "express";
import { UploadController } from "../controllers/UploadController";
import { upload, imageUpload, documentUpload, videoUpload } from "../middleware/multer";

const router = Router();
const uploadController = new UploadController();

// Personal OneDrive upload routes
// Image upload to personal drive
router.post("/image", imageUpload.single("image"), (req, res) =>
  uploadController.uploadToPersonalDrive(req, res)
);

// Generic file upload to personal drive
router.post("/file", upload.single("file"), (req, res) =>
  uploadController.uploadFileToPersonalDrive(req, res)
);

// Document upload to personal drive
router.post("/document", documentUpload.single("document"), (req, res) =>
  uploadController.uploadDocumentToPersonalDrive(req, res)
);

// Video upload to personal drive
router.post("/video", videoUpload.single("video"), (req, res) =>
  uploadController.uploadVideoToPersonalDrive(req, res)
);

export default router;