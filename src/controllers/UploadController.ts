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
      const { webUrl, shareUrl, fileName, directUrl, embedUrl } =
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
}
