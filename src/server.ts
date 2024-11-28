import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import multer from "multer";
import { UploadController } from "./controllers/UploadController";

const start = () => {
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

  const upload = multer({
    dest: "uploads/",
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

  app.post("/api/upload/image", upload.single("image"), (req, res) =>
    uploadController.uploadImage(req, res)
  );

  const PORT = process.env.PORT || 9000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

start();
