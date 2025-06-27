import axios, { AxiosError } from "axios";
import { MICROSOFT_CONFIG } from "../config/microsoft";
import { createReadStream } from "fs";
import * as fs from "fs";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  ext_expires_in: number;
}

interface DriveResponse {
  value: Array<{
    id: string;
    driveType: string;
    name?: string;
    owner?: {
      user?: {
        displayName?: string;
        email?: string;
      };
    };
  }>;
}

interface OneDriveFile {
  id: string;
  name: string;
  webUrl: string;
  shareUrl?: string;
  size: number;
  createdDateTime: string;
  lastModifiedDateTime: string;
  thumbnailUrl?: string;
}

export class OneDriveService {
  private accessToken: string | null = null;
  private tokenExpiration: Date | null = null;

  private async getAccessToken(): Promise<string> {
    try {
      // Check if current token is still valid
      if (
        this.accessToken &&
        this.tokenExpiration &&
        this.tokenExpiration > new Date()
      ) {
        return this.accessToken;
      }

      // Check required environment variables
      if (
        !MICROSOFT_CONFIG.clientId ||
        !MICROSOFT_CONFIG.clientSecret ||
        !MICROSOFT_CONFIG.tenantId
      ) {
        throw new Error("Missing required Microsoft configuration");
      }

      const tokenEndpoint = `https://login.microsoftonline.com/${MICROSOFT_CONFIG.tenantId}/oauth2/v2.0/token`;

      const params = new URLSearchParams({
        client_id: MICROSOFT_CONFIG.clientId,
        client_secret: MICROSOFT_CONFIG.clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      });

      console.log("🔑 Requesting new access token...");

      const response = await axios.post<TokenResponse>(tokenEndpoint, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // Save token and expiration time
      this.accessToken = response.data.access_token;
      // Subtract 5 minutes for safety margin
      this.tokenExpiration = new Date(
        Date.now() + (response.data.expires_in - 300) * 1000
      );
      console.log("🔑 Access token:", this.accessToken);
      console.log("✅ Access token acquired successfully");
      console.log(
        `📅 Token expires at: ${this.tokenExpiration.toLocaleString()}`
      );

      return this.accessToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;

        console.error("❌ Failed to get access token");
        console.error("Status:", axiosError.response?.status);
        console.error("Error:", axiosError.response?.data);

        if (axiosError.response?.status === 401) {
          throw new Error("Authentication failed: Invalid credentials");
        } else if (axiosError.response?.status === 400) {
          throw new Error(
            `Bad request: ${
              axiosError.response.data?.error_description || "Unknown error"
            }`
          );
        } else if (axiosError.code === "ECONNREFUSED") {
          throw new Error(
            "Connection failed: Unable to reach Microsoft servers"
          );
        }

        throw new Error(
          `Microsoft API error: ${
            axiosError.response?.data?.error_description || axiosError.message
          }`
        );
      }

      throw new Error(
        `Unexpected error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Helper function to refresh token when needed
  async refreshTokenIfNeeded(): Promise<void> {
    try {
      if (
        !this.accessToken ||
        !this.tokenExpiration ||
        this.tokenExpiration <= new Date()
      ) {
        await this.getAccessToken();
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      throw error;
    }
  }

  // Helper function to check token status
  getTokenStatus(): {
    hasToken: boolean;
    isValid: boolean;
    expiresIn?: number;
  } {
    const now = new Date();
    const expiresIn = this.tokenExpiration
      ? Math.floor((this.tokenExpiration.getTime() - now.getTime()) / 1000)
      : undefined;

    return {
      hasToken: !!this.accessToken,
      isValid: !!this.tokenExpiration && this.tokenExpiration > now,
      expiresIn,
    };
  }

  async getAllDrives(): Promise<DriveResponse> {
    try {
      // Ensure valid token
      await this.refreshTokenIfNeeded();

      console.log("📂 Fetching all drives...");

      const response = await axios.get<DriveResponse>(
        "https://graph.microsoft.com/v1.0/drives",
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      this.handleApiError(error, "Failed to fetch drives");
    }
  }

  async getDriveDetails(driveId: string) {
    try {
      await this.refreshTokenIfNeeded();

      console.log(`📂 Fetching details for drive: ${driveId}`);

      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      this.handleApiError(
        error,
        `Failed to fetch drive details for ID: ${driveId}`
      );
    }
  }

  private handleApiError(error: any, context: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;

      console.error(`❌ ${context}`);
      console.error("Status:", axiosError.response?.status);
      console.error("Error:", axiosError.response?.data);

      if (axiosError.response?.status === 401) {
        throw new Error("Authentication failed: Token might be expired");
      } else if (axiosError.response?.status === 404) {
        throw new Error("Resource not found");
      } else if (axiosError.response?.status === 403) {
        throw new Error(
          "Permission denied: Check your application permissions"
        );
      }

      throw new Error(
        `Microsoft Graph API error: ${
          axiosError.response?.data?.error?.message || axiosError.message
        }`
      );
    }

    throw new Error(
      `Unexpected error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  async uploadImage(
    originalname: string,
    filePathOrBuffer: string | Buffer,
    driveId: string,
    folderId: string,
    customFileName?: string
  ): Promise<{ webUrl: string; shareUrl: string; fileName: string; directUrl: string; embedUrl: string }> {
    try {
      await this.refreshTokenIfNeeded();

      // Get file extension from original name
      const fileExtension = originalname.split(".").pop() || "";
      console.log("🔍 File extension:", fileExtension);

      // Use custom file name if provided, otherwise use original
      const fileName = customFileName
        ? `${customFileName}.${fileExtension}`
        : originalname;

      console.log(`📤 Uploading ${fileName} to folder ID: ${folderId}...`);

      // Handle both buffer (Vercel) and file path (local)
      let fileData: Buffer | fs.ReadStream;
      let fileSize: number;

      if (Buffer.isBuffer(filePathOrBuffer)) {
        // For Vercel serverless - use buffer
        fileData = filePathOrBuffer;
        fileSize = filePathOrBuffer.length;
      } else {
        // For local development - use file path
        fileData = createReadStream(filePathOrBuffer);
        const fileStats = await fs.promises.stat(filePathOrBuffer);
        fileSize = fileStats.size;
      }

      // 1. Create upload session
      const sessionResponse = await axios.post(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}:/${fileName}:/createUploadSession`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const uploadUrl = sessionResponse.data.uploadUrl;

      // 2. Upload file with progress tracking
      const uploadResponse = await axios.put(uploadUrl, fileData, {
        headers: {
          "Content-Length": fileSize,
          "Content-Range": `bytes 0-${fileSize - 1}/${fileSize}`,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
          console.log(`⏳ Upload progress: ${percentCompleted}%`);
        },
      });

      const fileId = uploadResponse.data.id;

      // 3. Create sharing link
      const sharingResponse = await axios.post(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/createLink`,
        {
          type: "view",
          scope: "anonymous",
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 4. Get direct download URL for the image
      const itemResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Extract direct URL from @microsoft.graph.downloadUrl
      const directUrl = itemResponse.data["@microsoft.graph.downloadUrl"];

      // 5. Get thumbnail URL for embedding
      const thumbnailResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/thumbnails`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Get the large thumbnail URL (or you can use medium/small)
      const thumbnailUrl = thumbnailResponse.data.value[0]?.large?.url || "";
      
      // Create embed URL using OneDrive's embed format
      // Extract the share ID from the share URL
      const shareId = sharingResponse.data.link.webUrl.split('/s/')[1]?.split('/')[0] || '';
      const embedUrl = shareId ? `https://onedrive.live.com/embed?resid=${shareId}` : '';

      console.log("✅ File uploaded successfully");
      console.log("📎 Web URL:", uploadResponse.data.webUrl);
      console.log("🔗 Share URL:", sharingResponse.data.link.webUrl);
      console.log("🖼️ Direct URL:", directUrl);
      console.log("🖼️ Thumbnail URL:", thumbnailUrl);
      console.log("📄 File name:", fileName);

      return {
        webUrl: uploadResponse.data.webUrl,
        shareUrl: sharingResponse.data.link.webUrl,
        fileName: fileName,
        directUrl: directUrl,
        embedUrl: thumbnailUrl || directUrl, // Use thumbnail URL for embedding, fallback to direct URL
      };
    } catch (error) {
      console.error("❌ Upload failed:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Status:", error.response?.status);
        throw new Error(
          `Upload failed: ${
            error.response?.data?.error?.message || error.message
          }`
        );
      }
      throw error;
    }
  }

  // Helper method to generate a unique filename
  private generateUniqueFileName(originalName: string): string {
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(7);
    const extension = originalName.split(".").pop();
    return `file_${timestamp}_${random}.${extension}`;
  }

  async ensureUploadFolder(
    driveId: string,
    customFolderName?: string
  ): Promise<string> {
    try {
      await this.refreshTokenIfNeeded();

      // First, get Pictures folder ID
      let picturesFolderId: string;
      try {
        const picturesResponse = await axios.get(
          `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/Pictures`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );
        picturesFolderId = picturesResponse.data.id;
        console.log("📁 Found Pictures folder ID:", picturesFolderId);
      } catch (error) {
        console.error("❌ Pictures folder not found");
        throw error;
      }

      // Use custom folder name or default to 'uploads'
      const folderName = customFolderName || "uploads";

      // Then, try to find the folder
      try {
        const folderResponse = await axios.get(
          `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${picturesFolderId}/children?$filter=name eq '${folderName}'`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );

        if (folderResponse.data.value.length > 0) {
          const folderId = folderResponse.data.value[0].id;
          console.log(`📁 Found existing folder "${folderName}" ID:`, folderId);
          return folderId;
        }
      } catch (error) {
        console.log(`📁 Folder "${folderName}" not found, creating new one...`);
      }

      // Create folder if it doesn't exist
      const newFolderResponse = await axios.post(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${picturesFolderId}/children`,
        {
          name: folderName,
          folder: {},
          "@microsoft.graph.conflictBehavior": "replace",
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const folderId = newFolderResponse.data.id;
      console.log(`✅ Created new folder "${folderName}" ID:`, folderId);
      return folderId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Failed to ensure folder exists:", {
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      throw error;
    }
  }

  async createFolder(
    driveId: string,
    parentFolderId: string,
    folderName: string
  ): Promise<string> {
    try {
      await this.refreshTokenIfNeeded();

      console.log(
        `📁 Creating folder "${folderName}" in parent folder ${parentFolderId}...`
      );

      const response = await axios.post(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${parentFolderId}/children`,
        {
          name: folderName,
          folder: {},
          "@microsoft.graph.conflictBehavior": "replace",
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Folder created successfully:", response.data);
      return response.data.id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Failed to create folder:", {
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      throw error;
    }
  }

  async getAllFilesInFolder(
    driveId: string,
    folderId: string
  ): Promise<OneDriveFile[]> {
    try {
      await this.refreshTokenIfNeeded();

      // Get files with thumbnails
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}/children?$expand=thumbnails`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const files = await Promise.all(
        response.data.value.map(async (file: any) => {
          // Get sharing link for each file
          const sharingResponse = await axios.post(
            `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${file.id}/createLink`,
            {
              type: "view",
              scope: "anonymous",
            },
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("🔗 Thumbnail URL:", file.thumbnails?.[0]);

          return {
            id: file.id,
            name: file.name,
            webUrl: file.webUrl,
            shareUrl: sharingResponse.data.link.webUrl,
            size: file.size,
            createdDateTime: file.createdDateTime,
            lastModifiedDateTime: file.lastModifiedDateTime,
            thumbnailUrl: file.thumbnails?.[0]?.large?.url || null,
          };
        })
      );

      console.log(`📂 Found ${files.length} files in folder`);
      return files;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Failed to get files:", {
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      throw error;
    }
  }

  // Optional: Get files with pagination
  async getAllFilesInFolderWithPagination(
    driveId: string,
    folderId: string,
    pageSize: number = 10,
    skipToken?: string
  ): Promise<{ files: OneDriveFile[]; nextPageToken?: string }> {
    try {
      await this.refreshTokenIfNeeded();

      let url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}/children?$expand=thumbnails&$top=${pageSize}`;
      if (skipToken) {
        url += `&$skiptoken=${skipToken}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const files = await Promise.all(
        response.data.value.map(async (file: any) => {
          const sharingResponse = await axios.post(
            `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${file.id}/createLink`,
            {
              type: "view",
              scope: "anonymous",
            },
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          return {
            id: file.id,
            name: file.name,
            webUrl: file.webUrl,
            shareUrl: sharingResponse.data.link.webUrl,
            size: file.size,
            createdDateTime: file.createdDateTime,
            lastModifiedDateTime: file.lastModifiedDateTime,
            thumbnailUrl: file.thumbnails?.[0]?.large?.url || null,
          };
        })
      );

      return {
        files,
        nextPageToken:
          response.data["@odata.nextLink"]?.match(/skiptoken=(.*)/)?.[1],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Failed to get files:", {
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      throw error;
    }
  }
}
