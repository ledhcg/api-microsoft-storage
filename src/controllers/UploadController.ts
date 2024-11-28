import { Request, Response } from "express";
import { OneDriveService } from "../services/OneDriveService";
import { StatusCodes } from "http-status-codes";
import { unlinkSync } from "fs";
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

      // Upload file using the folder ID
      const { webUrl, shareUrl, fileName } =
        await this.oneDriveService.uploadImage(
          req.file.originalname,
          req.file.path,
          MICROSOFT_CONFIG.driveId,
          uploadFolderId
        );

      // Delete temp file
      unlinkSync(req.file.path);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          webUrl,
          shareUrl,
          fileName,
          folderName: folderName || "uploads",
        },
      });
    } catch (error) {
      console.error("Upload error:", error);

      // Cleanup temp file if exists
      if (req.file?.path) {
        try {
          unlinkSync(req.file.path);
        } catch (e) {
          console.error("Failed to delete temp file:", e);
        }
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload image",
      });
    }
  }
}
