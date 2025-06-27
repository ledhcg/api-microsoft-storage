import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'http://localhost:3000';

// Test file paths (you'll need to create these test files)
const TEST_FILES = {
  image: {
    path: path.join(__dirname, 'test-files', 'test-image.jpg'),
    name: 'test-image.jpg',
    type: 'image/jpeg'
  },
  document: {
    path: path.join(__dirname, 'test-files', 'test-document.docx'),
    name: 'test-document.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },
  video: {
    path: path.join(__dirname, 'test-files', 'test-video.mp4'),
    name: 'test-video.mp4',
    type: 'video/mp4'
  },
  pdf: {
    path: path.join(__dirname, 'test-files', 'test-document.pdf'),
    name: 'test-document.pdf',
    type: 'application/pdf'
  }
};

// Create test files directory if it doesn't exist
const testFilesDir = path.join(__dirname, 'test-files');
if (!fs.existsSync(testFilesDir)) {
  fs.mkdirSync(testFilesDir, { recursive: true });
  console.log('📁 Created test-files directory');
  console.log('⚠️  Please add test files to:', testFilesDir);
  console.log('   - test-image.jpg (any image file)');
  console.log('   - test-document.docx (any Word document)');
  console.log('   - test-video.mp4 (any video file)');
  console.log('   - test-document.pdf (any PDF file)');
  process.exit(1);
}

interface UploadResponse {
  success: boolean;
  data: {
    webUrl: string;
    shareUrl: string;
    directUrl: string;
    embedUrl: string;
    thumbnailUrl?: string;
    fileName: string;
    folderName: string;
    fileType: string;
    uploadType: string;
  };
}

async function uploadFile(
  endpoint: string,
  filePath: string,
  fileName: string,
  fileType: string,
  fieldName: string = 'file',
  customFileName?: string,
  folderName?: string
): Promise<UploadResponse> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Test file not found: ${filePath}`);
    }

    const formData = new FormData();
    formData.append(fieldName, fs.createReadStream(filePath), {
      filename: fileName,
      contentType: fileType
    });

    if (customFileName) {
      formData.append('customFileName', customFileName);
    }

    if (folderName) {
      formData.append('folderName', folderName);
    }

    console.log(`📤 Uploading ${fileName} to ${endpoint}...`);
    
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000, // 60 seconds timeout for large files
    });

    return response.data;
  } catch (error) {
    console.error(`❌ Upload failed for ${fileName}:`, error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
}

function validateResponse(response: UploadResponse, expectedFileType: string, expectedUploadType: string) {
  console.log('✅ Upload successful!');
  console.log('📊 Response data:');
  console.log(`   - File Name: ${response.data.fileName}`);
  console.log(`   - File Type: ${response.data.fileType}`);
  console.log(`   - Upload Type: ${response.data.uploadType}`);
  console.log(`   - Folder: ${response.data.folderName}`);
  console.log(`   - Web URL: ${response.data.webUrl}`);
  console.log(`   - Share URL: ${response.data.shareUrl}`);
  console.log(`   - Direct URL: ${response.data.directUrl}`);
  console.log(`   - Embed URL: ${response.data.embedUrl}`);
  console.log(`   - Thumbnail URL: ${response.data.thumbnailUrl || 'N/A'}`);

  // Validate response structure
  const requiredFields = ['webUrl', 'shareUrl', 'directUrl', 'embedUrl', 'fileName', 'folderName', 'fileType', 'uploadType'];
  for (const field of requiredFields) {
    if (!response.data[field as keyof typeof response.data]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate file type
  if (response.data.fileType !== expectedFileType) {
    throw new Error(`Expected fileType '${expectedFileType}', got '${response.data.fileType}'`);
  }

  // Validate upload type
  if (response.data.uploadType !== expectedUploadType) {
    throw new Error(`Expected uploadType '${expectedUploadType}', got '${response.data.uploadType}'`);
  }

  console.log('✅ Response validation passed!\n');
}

async function testGenericFileUpload() {
  console.log('🧪 Testing Generic File Upload Endpoints...');
  
  try {
    // Test organizational file upload
    console.log('\n📋 Testing /api/upload/file (organizational)...');
    const orgResponse = await uploadFile(
      '/api/upload/file',
      TEST_FILES.pdf.path,
      TEST_FILES.pdf.name,
      TEST_FILES.pdf.type,
      'file',
      'test-generic-org',
      'generic-uploads'
    );
    validateResponse(orgResponse, 'pdf', 'organizational');

    // Test personal file upload
    console.log('📋 Testing /api/upload/file/personal (personal)...');
    const personalResponse = await uploadFile(
      '/api/upload/file/personal',
      TEST_FILES.pdf.path,
      TEST_FILES.pdf.name,
      TEST_FILES.pdf.type,
      'file',
      'test-generic-personal',
      'generic-uploads'
    );
    validateResponse(personalResponse, 'pdf', 'personal');

  } catch (error) {
    console.error('❌ Generic file upload test failed:', error);
    throw error;
  }
}

async function testImageUpload() {
  console.log('🧪 Testing Image Upload Endpoints...');
  
  try {
    // Test organizational image upload
    console.log('\n🖼️ Testing /api/upload/image (organizational)...');
    const orgResponse = await uploadFile(
      '/api/upload/image',
      TEST_FILES.image.path,
      TEST_FILES.image.name,
      TEST_FILES.image.type,
      'image',
      'test-image-org',
      'image-uploads'
    );
    validateResponse(orgResponse, 'image', 'organizational');

    // Test personal image upload
    console.log('🖼️ Testing /api/upload/personal (personal)...');
    const personalResponse = await uploadFile(
      '/api/upload/personal',
      TEST_FILES.image.path,
      TEST_FILES.image.name,
      TEST_FILES.image.type,
      'image',
      'test-image-personal',
      'image-uploads'
    );
    validateResponse(personalResponse, 'image', 'personal');

  } catch (error) {
    console.error('❌ Image upload test failed:', error);
    throw error;
  }
}

async function testDocumentUpload() {
  console.log('🧪 Testing Document Upload Endpoints...');
  
  try {
    // Test organizational document upload
    console.log('\n📄 Testing /api/upload/document (organizational)...');
    const orgResponse = await uploadFile(
      '/api/upload/document',
      TEST_FILES.document.path,
      TEST_FILES.document.name,
      TEST_FILES.document.type,
      'document',
      'test-doc-org',
      'document-uploads'
    );
    validateResponse(orgResponse, 'office', 'organizational');

    // Test personal document upload
    console.log('📄 Testing /api/upload/document/personal (personal)...');
    const personalResponse = await uploadFile(
      '/api/upload/document/personal',
      TEST_FILES.document.path,
      TEST_FILES.document.name,
      TEST_FILES.document.type,
      'document',
      'test-doc-personal',
      'document-uploads'
    );
    validateResponse(personalResponse, 'office', 'personal');

  } catch (error) {
    console.error('❌ Document upload test failed:', error);
    throw error;
  }
}

async function testVideoUpload() {
  console.log('🧪 Testing Video Upload Endpoints...');
  
  try {
    // Test organizational video upload
    console.log('\n🎥 Testing /api/upload/video (organizational)...');
    const orgResponse = await uploadFile(
      '/api/upload/video',
      TEST_FILES.video.path,
      TEST_FILES.video.name,
      TEST_FILES.video.type,
      'video',
      'test-video-org',
      'video-uploads'
    );
    validateResponse(orgResponse, 'video', 'organizational');

    // Test personal video upload
    console.log('🎥 Testing /api/upload/video/personal (personal)...');
    const personalResponse = await uploadFile(
      '/api/upload/video/personal',
      TEST_FILES.video.path,
      TEST_FILES.video.name,
      TEST_FILES.video.type,
      'video',
      'test-video-personal',
      'video-uploads'
    );
    validateResponse(personalResponse, 'video', 'personal');

  } catch (error) {
    console.error('❌ Video upload test failed:', error);
    throw error;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Multi-File Upload Tests...');
  console.log('⚠️  Make sure the server is running on http://localhost:3000');
  console.log('⚠️  Make sure you have configured MICROSOFT_USER_EMAIL for personal uploads\n');

  try {
    await testGenericFileUpload();
    await testImageUpload();
    await testDocumentUpload();
    await testVideoUpload();

    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Generic file upload (organizational & personal)');
    console.log('   ✅ Image upload (organizational & personal)');
    console.log('   ✅ Document upload (organizational & personal)');
    console.log('   ✅ Video upload (organizational & personal)');
    console.log('\n🔗 Total endpoints tested: 8');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

export { runAllTests, testGenericFileUpload, testImageUpload, testDocumentUpload, testVideoUpload };