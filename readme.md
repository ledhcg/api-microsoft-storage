## Environment Configuration Guide

### Getting Microsoft Azure Credentials

Follow these steps to obtain the required Microsoft Azure credentials:

1. **Register a new application in Azure AD:**

   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to "Azure Active Directory" > "App registrations"
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
       3. Make a GET request to: `https://graph.microsoft.com/v1.0/me/drives`
       4. Look for the "id" field in the response

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
     ```

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

### Running Tests

1. **Make sure your `.env` file is configured correctly**

2. **Run the test suite:**
   ```bash
   npm run test:ms-auth
   npm run test:ms-drive
   npm run test:ms-upload
   npm run test:ms-files
   # or
   yarn test:ms-auth
   yarn test:ms-drive
   yarn test:ms-upload
   yarn test:ms-files
   ```

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
