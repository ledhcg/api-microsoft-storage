import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import FormData from "form-data";

// Test upload to personal OneDrive
async function testPersonalUpload() {
  try {
    console.log("🧪 Testing personal OneDrive upload...");

    // Check if test image exists
    const imagePath = path.join(__dirname, "test-image.jpg");
    if (!fs.existsSync(imagePath)) {
      console.error("❌ Test image not found at:", imagePath);
      console.log("Please add a test image file named 'test-image.jpg' in the test directory");
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append("image", fs.createReadStream(imagePath));
    formData.append("folderName", "test-personal-uploads");
    formData.append("customFileName", `test-personal-${Date.now()}`);

    // Make request to personal upload endpoint
    const response = await axios.post(
      "http://localhost:9000/api/upload/personal",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    console.log("✅ Personal upload successful!");
    console.log("📊 Response:", JSON.stringify(response.data, null, 2));

    // Validate response structure
    const { data } = response.data;
    if (data.uploadType === "personal") {
      console.log("✅ Upload type correctly identified as 'personal'");
    }

    if (data.thumbnailUrl) {
      console.log("✅ Thumbnail URL included:", data.thumbnailUrl);
    }

    console.log("🔗 URLs generated:");
    console.log("   - Web URL:", data.webUrl);
    console.log("   - Share URL:", data.shareUrl);
    console.log("   - Direct URL:", data.directUrl);
    console.log("   - Embed URL:", data.embedUrl);
    console.log("   - Thumbnail URL:", data.thumbnailUrl);

  } catch (error) {
    console.error("❌ Personal upload test failed:");
    
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      
      if (error.code === "ECONNREFUSED") {
        console.error("💡 Make sure the server is running on http://localhost:9000");
        console.error("   Run: npm run development");
      }
    } else {
      console.error("Error:", error);
    }
  }
}

// Test comparison between personal and organizational upload
async function testUploadComparison() {
  try {
    console.log("\n🔄 Testing upload comparison (Personal vs Organization)...");

    const imagePath = path.join(__dirname, "test-image.jpg");
    if (!fs.existsSync(imagePath)) {
      console.error("❌ Test image not found");
      return;
    }

    // Test organizational upload
    console.log("📤 Testing organizational upload...");
    const orgFormData = new FormData();
    orgFormData.append("image", fs.createReadStream(imagePath));
    orgFormData.append("folderName", "test-org-uploads");

    const orgResponse = await axios.post(
      "http://localhost:9000/api/upload/image",
      orgFormData,
      {
        headers: {
          ...orgFormData.getHeaders(),
        },
        timeout: 30000,
      }
    );

    // Test personal upload
    console.log("📤 Testing personal upload...");
    const personalFormData = new FormData();
    personalFormData.append("image", fs.createReadStream(imagePath));
    personalFormData.append("folderName", "test-personal-uploads");

    const personalResponse = await axios.post(
      "http://localhost:9000/api/upload/personal",
      personalFormData,
      {
        headers: {
          ...personalFormData.getHeaders(),
        },
        timeout: 30000,
      }
    );

    console.log("\n📊 Comparison Results:");
    console.log("\n🏢 Organizational Upload:");
    console.log("   - Upload Type:", orgResponse.data.data.uploadType || "organization");
    console.log("   - Has Thumbnail:", !!orgResponse.data.data.thumbnailUrl);
    console.log("   - Folder:", orgResponse.data.data.folderName);

    console.log("\n👤 Personal Upload:");
    console.log("   - Upload Type:", personalResponse.data.data.uploadType);
    console.log("   - Has Thumbnail:", !!personalResponse.data.data.thumbnailUrl);
    console.log("   - Folder:", personalResponse.data.data.folderName);

    console.log("\n✅ Both upload methods working successfully!");

  } catch (error) {
    console.error("❌ Upload comparison test failed:", error);
  }
}

// Run tests
async function runTests() {
  console.log("🚀 Starting Personal OneDrive Upload Tests\n");
  
  await testPersonalUpload();
  await testUploadComparison();
  
  console.log("\n🏁 Tests completed!");
}

runTests().catch(console.error);