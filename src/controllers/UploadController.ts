import { Request, Response } from "express";
import { OneDriveService } from "../services/OneDriveService";
import { StatusCodes } from "http-status-codes";
import { MICROSOFT_CONFIG } from "../config/microsoft";

export class UploadController {
  private oneDriveService: OneDriveService;

  constructor() {
    this.oneDriveService = new OneDriveService();
  }

  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const { folderName } = req.body;

      // Get or create folder and get its ID
      const uploadFolderId = await this.oneDriveService.ensureUploadFolder(
        MICROSOFT_CONFIG.driveId,
        folderName
      );

      // Upload file using the folder ID and buffer for Vercel serverless
      const { webUrl, shareUrl, fileName, directUrl, embedUrl, thumbnailUrl } =
        await this.oneDriveService.uploadImage(
          req.file.originalname,
          req.file.buffer || req.file.path,
          MICROSOFT_CONFIG.driveId,
          uploadFolderId
        );

      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          webUrl,
          shareUrl,
          directUrl,
          embedUrl,
          thumbnailUrl,
          fileName,
          folderName: folderName || "uploads",
          fileType: "image",
          uploadType: "organizational",
        },
      });
    } catch (error) {
      console.error("Upload error:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload image",
      });
    }
  }

  async uploadToPersonalDrive(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const { folderName, customFileName } = req.body;

      // Upload file to personal OneDrive
      const { webUrl, shareUrl, fileName, directUrl, embedUrl, thumbnailUrl } =
        await this.oneDriveService.uploadImageToPersonalDrive(
          req.file.originalname,
          req.file.buffer || req.file.path,
          customFileName,
          folderName
        );

      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          webUrl,
          shareUrl,
          directUrl,
          embedUrl,
          thumbnailUrl,
          fileName,
          folderName: folderName || "uploads",
          fileType: "image",
          uploadType: "personal",
        },
      });
    } catch (error) {
      console.error("Upload to personal drive error:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload image to personal drive",
      });
    }
  }

  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const { folderName, customFileName } = req.body;

      // Get or create folder and get its ID
      const uploadFolderId = await this.oneDriveService.ensureUploadFolder(
        MICROSOFT_CONFIG.driveId,
        folderName
      );

      // Upload file using the folder ID and buffer for Vercel serverless
      const { webUrl, shareUrl, fileName, directUrl, embedUrl, thumbnailUrl, fileType } =
        await this.oneDriveService.uploadFile(
          req.file.originalname,
          req.file.buffer || req.file.path,
          MICROSOFT_CONFIG.driveId,
          uploadFolderId,
          customFileName
        );

      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          webUrl,
          shareUrl,
          directUrl,
          embedUrl,
          thumbnailUrl,
          fileName,
          folderName: folderName || "uploads",
          fileType,
          uploadType: "organizational",
        },
      });
    } catch (error) {
      console.error("❌ File upload failed:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "File upload failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async uploadFileToPersonalDrive(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const { folderName, customFileName } = req.body;

      // Upload file to personal OneDrive
      const { webUrl, shareUrl, fileName, directUrl, embedUrl, thumbnailUrl, fileType } =
        await this.oneDriveService.uploadFileToPersonalDrive(
          req.file.originalname,
          req.file.buffer || req.file.path,
          customFileName,
          folderName
        );

      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          webUrl,
          shareUrl,
          directUrl,
          embedUrl,
          thumbnailUrl,
          fileName,
          folderName: folderName || "uploads",
          fileType,
          uploadType: "personal",
        },
      });
    } catch (error) {
      console.error("❌ Personal file upload failed:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Personal file upload failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async uploadDocument(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "No document uploaded",
        });
      }

      const { folderName, customFileName } = req.body;

      // Get or create folder and get its ID
      const uploadFolderId = await this.oneDriveService.ensureUploadFolder(
        MICROSOFT_CONFIG.driveId,
        folderName || "documents"
      );

      // Upload document using the folder ID and buffer for Vercel serverless
      const { webUrl, shareUrl, fileName, directUrl, embedUrl, thumbnailUrl, fileType } =
        await this.oneDriveService.uploadFile(
          req.file.originalname,
          req.file.buffer || req.file.path,
          MICROSOFT_CONFIG.driveId,
          uploadFolderId,
          customFileName
        );

      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          webUrl,
          shareUrl,
          directUrl,
          embedUrl,
          thumbnailUrl,
          fileName,
          folderName: folderName || "documents",
          fileType,
          uploadType: "organizational",
        },
      });
    } catch (error) {
      console.error("❌ Document upload failed:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Document upload failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async uploadDocumentToPersonalDrive(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "No document uploaded",
        });
      }

      const { folderName, customFileName } = req.body;

      // Upload document to personal OneDrive
      const { webUrl, shareUrl, fileName, directUrl, embedUrl, thumbnailUrl, fileType } =
        await this.oneDriveService.uploadFileToPersonalDrive(
          req.file.originalname,
          req.file.buffer || req.file.path,
          customFileName,
          folderName || "documents"
        );

      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          webUrl,
          shareUrl,
          directUrl,
          embedUrl,
          thumbnailUrl,
          fileName,
          folderName: folderName || "documents",
          fileType,
          uploadType: "personal",
        },
      });
    } catch (error) {
      console.error("❌ Personal document upload failed:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Personal document upload failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async uploadVideo(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "No video uploaded",
        });
      }

      const { folderName, customFileName } = req.body;

      // Get or create folder and get its ID
      const uploadFolderId = await this.oneDriveService.ensureUploadFolder(
        MICROSOFT_CONFIG.driveId,
        folderName || "videos"
      );

      // Upload video using the folder ID and buffer for Vercel serverless
      const { webUrl, shareUrl, fileName, directUrl, embedUrl, thumbnailUrl, fileType } =
        await this.oneDriveService.uploadFile(
          req.file.originalname,
          req.file.buffer || req.file.path,
          MICROSOFT_CONFIG.driveId,
          uploadFolderId,
          customFileName
        );

      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          webUrl,
          shareUrl,
          directUrl,
          embedUrl,
          thumbnailUrl,
          fileName,
          folderName: folderName || "videos",
          fileType,
          uploadType: "organizational",
        },
      });
    } catch (error) {
      console.error("❌ Video upload failed:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Video upload failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async uploadVideoToPersonalDrive(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "No video uploaded",
        });
      }

      const { folderName, customFileName } = req.body;

      // Upload video to personal OneDrive
      const { webUrl, shareUrl, fileName, directUrl, embedUrl, thumbnailUrl, fileType } =
        await this.oneDriveService.uploadFileToPersonalDrive(
          req.file.originalname,
          req.file.buffer || req.file.path,
          customFileName,
          folderName || "videos"
        );

      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          webUrl,
          shareUrl,
          directUrl,
          embedUrl,
          thumbnailUrl,
          fileName,
          folderName: folderName || "videos",
          fileType,
          uploadType: "personal",
        },
      });
    } catch (error) {
      console.error("❌ Personal video upload failed:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Personal video upload failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
