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
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only image files are allowed!"));
    }
  },
});

const uploadController = new UploadController();

app.get("/", (_, res) => {
  res.json({
    message: "Hello, world!",
  });
});

app.post("/api/upload/image", upload.single("image"), (req, res) =>
  uploadController.uploadImage(req, res)
);

app.post("/api/upload/personal", upload.single("image"), (req, res) =>
  uploadController.uploadToPersonalDrive(req, res)
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
