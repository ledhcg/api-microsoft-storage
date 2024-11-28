import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

async function testImageUpload() {
  try {
    const testImagePath = path.join(__dirname, "test-image.jpg");

    const formData = new FormData();
    formData.append("image", fs.createReadStream(testImagePath));

    console.log("📤 Uploading test image...");

    const response = await axios.post(
      "http://localhost:9000/api/upload/image",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    console.log("✅ Upload successful!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Upload failed:", error.response?.data || error.message);
  }
}

testImageUpload();
