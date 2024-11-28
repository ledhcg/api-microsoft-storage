import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MICROSOFT_CONFIG } from "../config/microsoft";
import { OneDriveService } from "../services/OneDriveService";

export class FileController {
  constructor(private readonly oneDriveService: OneDriveService) {}

  async getFiles(req: Request, res: Response) {
    try {
      const { driveId } = MICROSOFT_CONFIG;
      const { folderName } = req.query;

      const uploadFolderId = await this.oneDriveService.ensureUploadFolder(
        driveId,
        folderName as string
      );

      const files = await this.oneDriveService.getAllFilesInFolder(
        driveId,
        uploadFolderId
      );

      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          files,
          folderName: folderName || "uploads",
        },
      });
    } catch (error) {
      console.error("Failed to get files:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get files",
      });
    }
  }

  // With pagination
  async getFilesPaginated(req: Request, res: Response) {
    try {
      const { driveId } = MICROSOFT_CONFIG;
      const { pageSize = 10, pageToken, folderName } = req.query;

      const uploadFolderId = await this.oneDriveService.ensureUploadFolder(
        driveId,
        folderName as string
      );

      const { files, nextPageToken } =
        await this.oneDriveService.getAllFilesInFolderWithPagination(
          driveId,
          uploadFolderId,
          Number(pageSize),
          pageToken as string
        );

      return res.status(StatusCodes.OK).json({
        success: true,
        data: {
          files,
          nextPageToken,
        },
      });
    } catch (error) {
      console.error("Failed to get files:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get files",
      });
    }
  }
}
