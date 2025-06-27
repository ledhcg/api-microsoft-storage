## Environment Configuration Guide

### Getting Microsoft Azure Credentials

Follow these steps to obtain the required Microsoft Azure credentials:

1. **Register a new application in Azure AD:**

   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to "Azure Active Directory" > "[App registrations](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps)"
   - Click "New registration"
   - Name your application
   - Select "Accounts in any organizational directory (Any Azure AD directory - Multitenant)"
   - Set Redirect URI (Web) to `http://localhost`
   - Click "Register"

2. **Get Client ID and Tenant ID:**

   - After registration, copy the "Application (client) ID" - This is your `MICROSOFT_CLIENT_ID`
   - Copy the "Directory (tenant) ID" - This is your `MICROSOFT_TENANT_ID`

3. **Create Client Secret:**

   - In your app registration, go to "Certificates & secrets"
   - Click "New client secret"
   - Add a description and choose expiration
   - Click "Add"
   - Copy the generated secret value - This is your `MICROSOFT_CLIENT_SECRET`
     > ⚠️ Make sure to copy the secret immediately as it won't be visible again

4. **Get Drive ID:**

   - To get the Drive ID, you can:

     - Option 1: Use Microsoft Graph Explorer:

       1. Go to [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
       2. Sign in with your account
       3. Modify all permissions (Files.Read | Files.Read.All | Files.ReadWrite | Files.ReadWrite.All | Sites.Read.All)
       4. Make a GET request to: `https://graph.microsoft.com/v1.0/me/drives`
       5. Look for the "id" field in the response

     - Option 2: Use SharePoint API:

       1. Go to your SharePoint site
       2. Navigate to the document library
       3. The Drive ID will be in format: `b!{encoded-characters}`

     - Option 3: Run test-ms-file script:
       1. Configure your `.env` file with `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, and `MICROSOFT_TENANT_ID`
       2. Run command: `node test-ms-file.js`
       3. The script will output all available Drive IDs
       4. Copy the Drive ID that corresponds to your desired OneDrive location

   > Note: The Drive ID typically starts with "b!" followed by a string of encoded characters

5. **Configure API Permissions:**

   - In your app registration, go to "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Choose "Application permissions" (not Delegated permissions)
   - Search and add these required permissions:
     - `Files.ReadWrite.All` (Required for file operations)
     - `offline_access` (Required for refresh tokens)
     - `User.Read` (Required for user authentication)

   > ⚠️ Important Notes:
   >
   > - Make sure to select "Application permissions", not "Delegated permissions"
   > - All permissions above are mandatory for the application to work
   > - After adding permissions, you must click "Grant admin consent" button
   > - If "Grant admin consent" is grayed out, you need admin rights in your Azure AD
   > - Without admin consent, users will need to consent individually when they first use the app

   Steps to grant admin consent:

   1. Click "Grant admin consent" button (requires Azure AD admin role)
   2. Confirm the consent dialog
   3. All permissions should show "Granted" status with green checkmarks

   Troubleshooting:

   - If you can't grant admin consent, contact your Azure AD administrator
   - If permissions are not working, try removing and re-adding them
     > - Ensure your Azure AD account has sufficient privileges

6. **Update Environment Variables:**
   - Copy `.env.example` to `.env`
   - Fill in the values you obtained above:
     ```env
     MICROSOFT_CLIENT_ID=your_client_id
     MICROSOFT_CLIENT_SECRET=your_client_secret
     MICROSOFT_TENANT_ID=your_tenant_id
     MICROSOFT_DRIVE_ID=your_drive_id
     MICROSOFT_USER_EMAIL=your_user_email
     ```

   > **New Feature**: Personal OneDrive Support
   > 
   > - `MICROSOFT_USER_EMAIL`: Required for uploading to personal OneDrive
   > - This email should be the user's Microsoft account email
   > - Used to access personal OneDrive storage instead of SharePoint

> Note: Keep these credentials secure and never commit them to version control.

## Running the Application

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Microsoft Azure account with configured credentials (see above)

### Installation Steps

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**

   - Copy `.env.example` to `.env`

   ```bash
   cp .env.example .env
   ```

   - Update the `.env` file with your Microsoft credentials (see configuration guide above)

4. **Run the application:**

   ```bash
   # Development mode
   npm run development
   # or
   yarn development

   # Production mode
   npm run production
   # or
   yarn production
   ```

## API Endpoints

### Generic File Upload (All File Types)

**POST** `/api/upload/file`

- **Description**: Upload any file type to organizational SharePoint/OneDrive
- **Content-Type**: `multipart/form-data`
- **File Size Limit**: 100MB
- **Supported File Types**: Images, Documents, Videos, Audio, Archives, and more
- **Parameters**:
  - `file` (file): File to upload
  - `folderName` (string, optional): Custom folder name (default: "uploads")
  - `customFileName` (string, optional): Custom file name (without extension)

**POST** `/api/upload/file/personal`

- **Description**: Upload any file type to personal OneDrive
- **Content-Type**: `multipart/form-data`
- **File Size Limit**: 100MB
- **Parameters**:
  - `file` (file): File to upload
  - `folderName` (string, optional): Custom folder name (default: "uploads")
  - `customFileName` (string, optional): Custom file name (without extension)

### Image Upload (Backward Compatibility)

**POST** `/api/upload/image`

- **Description**: Upload image to organizational SharePoint/OneDrive
- **Content-Type**: `multipart/form-data`
- **File Size Limit**: 10MB
- **Supported Formats**: JPG, JPEG, PNG, GIF, BMP, WEBP, SVG, ICO, TIFF
- **Parameters**:
  - `image` (file): Image file to upload
  - `folderName` (string, optional): Custom folder name (default: "uploads")

**POST** `/api/upload/personal`

- **Description**: Upload image to personal OneDrive account
- **Content-Type**: `multipart/form-data`
- **File Size Limit**: 10MB
- **Parameters**:
  - `image` (file): Image file to upload
  - `folderName` (string, optional): Custom folder name (default: "uploads")
  - `customFileName` (string, optional): Custom file name (without extension)

### Document Upload

**POST** `/api/upload/document`

- **Description**: Upload document to organizational SharePoint/OneDrive
- **Content-Type**: `multipart/form-data`
- **File Size Limit**: 50MB
- **Supported Formats**: DOC, DOCX, XLS, XLSX, PPT, PPTX, PDF, TXT, RTF, MD, CSV
- **Parameters**:
  - `document` (file): Document file to upload
  - `folderName` (string, optional): Custom folder name (default: "documents")
  - `customFileName` (string, optional): Custom file name (without extension)

**POST** `/api/upload/document/personal`

- **Description**: Upload document to personal OneDrive
- **Content-Type**: `multipart/form-data`
- **File Size Limit**: 50MB
- **Parameters**:
  - `document` (file): Document file to upload
  - `folderName` (string, optional): Custom folder name (default: "documents")
  - `customFileName` (string, optional): Custom file name (without extension)

### Video Upload

**POST** `/api/upload/video`

- **Description**: Upload video to organizational SharePoint/OneDrive
- **Content-Type**: `multipart/form-data`
- **File Size Limit**: 200MB
- **Supported Formats**: MP4, AVI, MOV, WMV, FLV, WEBM, MKV, 3GP, M4V
- **Parameters**:
  - `video` (file): Video file to upload
  - `folderName` (string, optional): Custom folder name (default: "videos")
  - `customFileName` (string, optional): Custom file name (without extension)

**POST** `/api/upload/video/personal`

- **Description**: Upload video to personal OneDrive
- **Content-Type**: `multipart/form-data`
- **File Size Limit**: 200MB
- **Parameters**:
  - `video` (file): Video file to upload
  - `folderName` (string, optional): Custom folder name (default: "videos")
  - `customFileName` (string, optional): Custom file name (without extension)

### Response Format (All Endpoints)

**Success Response**:
```json
{
  "success": true,
  "data": {
    "webUrl": "https://...",
    "shareUrl": "https://...",
    "directUrl": "https://...",
    "embedUrl": "https://...",
    "thumbnailUrl": "https://..." // Available for images, videos, and documents
    "fileName": "file.ext",
    "folderName": "uploads",
    "fileType": "image|video|office|pdf|text|audio|archive|other",
    "uploadType": "organizational|personal"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### File Type Detection

The API automatically detects file types based on file extensions:

- **Images**: jpg, jpeg, png, gif, bmp, webp, svg, ico, tiff, tif
- **Videos**: mp4, avi, mov, wmv, flv, webm, mkv, 3gp, m4v
- **Audio**: mp3, wav, flac, aac, ogg, wma, m4a
- **Office Documents**: doc, docx, xls, xlsx, ppt, pptx
- **PDF**: pdf
- **Text Files**: txt, rtf, md, csv
- **Archives**: zip, rar, 7z, tar, gz
- **Other**: Any other file type

### Thumbnail Support

Thumbnails are automatically generated for supported file types:
- ✅ Images (all formats)
- ✅ Videos (most formats)
- ✅ Office Documents (Word, Excel, PowerPoint)
- ✅ PDF files
- ❌ Audio files, archives, and other formats
```

### Features

- **Multi-File Type Support**: Upload images, documents, videos, audio files, archives, and more
- **Enhanced Thumbnail Support**: Automatic thumbnail generation for images, videos, and documents with fallback options (large → medium → small)
- **Personal OneDrive Access**: Upload directly to user's personal OneDrive account
- **Organizational SharePoint**: Upload to company SharePoint/OneDrive for Business
- **Custom File Names**: Support for custom file naming without extension
- **Flexible Folder Structure**: Create custom folders for organization with default folders per file type
- **Multiple URL Types**: Web URL, share URL, direct download URL, embed URL, and thumbnail URL
- **File Type Detection**: Automatic file type classification based on extension
- **Size Limits**: Different size limits per file type (10MB images, 50MB documents, 200MB videos, 100MB general)
- **Progress Tracking**: Upload progress monitoring for large files
- **Error Handling**: Comprehensive error handling with detailed error messages

### Running Tests

1. **Make sure your `.env` file is configured correctly**

2. **Run the test suite:**
   ```bash
   # Basic Microsoft Graph API tests
   npm run test:ms-auth          # Test authentication
   npm run test:ms-drive         # Test drive access
   npm run test:ms-upload        # Test basic upload
   npm run test:ms-files         # Test file operations
   
   # Personal OneDrive tests
   npm run test:personal-upload  # Test personal OneDrive upload
   
   # Multi-file type upload tests
   npm run test:multi-file-upload # Test all file types and endpoints
   
   # or using yarn
   yarn test:ms-auth
   yarn test:ms-drive
   yarn test:ms-upload
   yarn test:ms-files
   yarn test:personal-upload
   yarn test:multi-file-upload
   ```

3. **For multi-file upload tests:**
   - Create a `test/test-files/` directory
   - Add sample files:
     - `test-image.jpg` (any image file)
     - `test-document.docx` (any Word document)
     - `test-video.mp4` (any video file)
     - `test-document.pdf` (any PDF file)
   - Run `npm run test:multi-file-upload`

### Common Issues and Troubleshooting

1. **Authentication Errors:**

   - Verify your Microsoft credentials in `.env` file
   - Ensure all required permissions are granted in Azure Portal
   - Check if your client secret hasn't expired

2. **File Upload Issues:**

   - Verify your Drive ID is correct
   - Ensure your application has sufficient permissions
   - Check file size limits and supported file types

3. **Connection Issues:**
   - Verify your internet connection
   - Check if Microsoft Graph API is accessible
   - Ensure your firewall isn't blocking the connections

For additional support, please refer to the [Issues](link-to-issues) section of the repository.
