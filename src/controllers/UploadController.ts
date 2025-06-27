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
}
