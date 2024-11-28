import axios from "axios";
import { MICROSOFT_CONFIG } from "../src/config/microsoft";
import { OneDriveService } from "../src/services/OneDriveService";

async function testGetAllFiles() {
  try {
    const oneDriveService = new OneDriveService();

    console.log("🔍 Getting upload folder...");
    // First get the upload folder ID
    const uploadFolderId = await oneDriveService.ensureUploadFolder(
      MICROSOFT_CONFIG.driveId,
      "test-upload"
    );
    console.log("📁 Upload folder ID:", uploadFolderId);

    console.log("\n📂 Getting all files...");
    const files = await oneDriveService.getAllFilesInFolder(
      MICROSOFT_CONFIG.driveId,
      uploadFolderId
    );

    console.log("\n✅ Files found:", files.length);
    console.log("\nFile details:");
    files.forEach((file, index) => {
      console.log(`\n📄 File ${index + 1}:`);
      console.log("Name:", file.name);
      console.log("ID:", file.id);
      console.log("Size:", formatFileSize(file.size));
      console.log("Created:", new Date(file.createdDateTime).toLocaleString());
      console.log(
        "Modified:",
        new Date(file.lastModifiedDateTime).toLocaleString()
      );
      console.log("Web URL:", file.webUrl);
      console.log("Share URL:", file.shareUrl);
      console.log("Thumbnail:", file.thumbnailUrl || "No thumbnail");
    });
  } catch (error) {
    console.error("\n❌ Test failed:");
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status);
      console.error("Error data:", error.response?.data);
    } else {
      console.error(error);
    }
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Test with pagination
async function testGetAllFilesWithPagination() {
  try {
    const oneDriveService = new OneDriveService();
    const pageSize = 5; // Number of items per page

    console.log("🔍 Getting upload folder...");
    const uploadFolderId = await oneDriveService.ensureUploadFolder(
      MICROSOFT_CONFIG.driveId,
      "test-upload"
    );
    console.log("📁 Upload folder ID:", uploadFolderId);

    let pageToken: string | undefined;
    let pageNumber = 1;

    do {
      console.log(`\n📃 Getting page ${pageNumber}...`);
      const result = await oneDriveService.getAllFilesInFolderWithPagination(
        MICROSOFT_CONFIG.driveId,
        uploadFolderId,
        pageSize,
        pageToken
      );

      console.log(
        `\n✅ Files found on page ${pageNumber}:`,
        result.files.length
      );

      result.files.forEach((file, index) => {
        console.log(`\n📄 File ${(pageNumber - 1) * pageSize + index + 1}:`);
        console.log("Name:", file.name);
        console.log("Size:", formatFileSize(file.size));
        console.log("Share URL:", file.shareUrl);
      });

      pageToken = result.nextPageToken;
      pageNumber++;

      // Optional: Add delay between pages to avoid rate limiting
      if (pageToken) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } while (pageToken);

    console.log("\n✅ All pages retrieved successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:");
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status);
      console.error("Error data:", error.response?.data);
    } else {
      console.error(error);
    }
  }
}

// Run tests
console.log("🚀 Starting file listing tests...\n");

// Choose which test to run
const testType = process.argv[2] || "all";

if (testType === "pagination" || testType === "all") {
  console.log("=== Testing Pagination ===");
  testGetAllFilesWithPagination();
}

if (testType === "simple" || testType === "all") {
  console.log("=== Testing Simple Get All Files ===");
  testGetAllFiles();
}
