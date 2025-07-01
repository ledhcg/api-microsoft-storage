# Microsoft Storage API - Architecture

## Overview

The project has been refactored to have a clearer structure and better maintainability. Key changes:

### 1. Multer Configuration Separation

**Before:**
- All multer configurations and allowedMimeTypes were defined directly in `server.ts`
- Long code and difficult to maintain

**After:**
- `src/config/multer.ts`: Contains all allowed file types and size limits
- `src/middleware/multer.ts`: Contains multer configurations for each file type

### 2. Routes Organization

**Before:**
- All routes were defined directly in `server.ts`
- Difficult to manage when the number of routes increases

**After:**
- `src/routes/index.ts`: Main router, directly mounts personal and sharepoint routes
- `src/routes/personal.ts`: Routes for Personal OneDrive uploads
- `src/routes/sharepoint.ts`: Routes for SharePoint/Organizational uploads
- Easy to add new routes for other functionalities

### 3. New Directory Structure

```
src/
├── config/
│   ├── microsoft.ts     # Microsoft Graph API configuration
│   └── multer.ts        # File types and size limits configuration
├── controllers/
│   ├── FileController.ts
│   └── UploadController.ts
├── middleware/
│   └── multer.ts        # Multer configurations
├── routes/
│   ├── index.ts         # Main router
│   ├── personal.ts      # Personal OneDrive routes
│   └── sharepoint.ts    # SharePoint/Organizational routes
├── services/
│   └── OneDriveService.ts
└── server.ts            # Main server file (simplified)
```

## Benefits of the New Structure

### 1. **Separation of Concerns**
- Each file has clear responsibilities
- Easy to find and modify code

### 2. **Maintainability**
- Add new file types: only need to modify `config/multer.ts`
- Add new routes: create new route file in `routes/`
- Add middleware: create file in `middleware/`

### 3. **Scalability**
- Easy to extend with new functionalities
- Can be split into microservices if needed

### 4. **Code Reusability**
- Multer configurations can be reused
- Middleware can be applied to multiple routes

## New Routes Structure

### Grouped Routes

The new structure organizes routes by functional groups:

```
/api/upload/
├── personal/          # Personal OneDrive routes
│   ├── /file         # Generic file upload
│   ├── /image        # Image upload
│   ├── /document     # Document upload
│   └── /video        # Video upload
└── sharepoint/        # SharePoint/Organizational routes
    ├── /file         # Generic file upload
    ├── /image        # Image upload
    ├── /document     # Document upload
    └── /video        # Video upload
```

### Benefits of the New Structure:

1. **Clearer**: Easy to distinguish between personal vs organizational uploads
2. **Consistent**: All file types follow the same pattern
3. **Scalable**: Easy to add new storage providers (Google Drive, Dropbox, etc.)
4. **Clean**: Removed legacy routes, keeping only clear structure

## How to Add New Features

### Adding New File Types:
1. Update `allowedMimeTypes` in `config/multer.ts`
2. Add to appropriate category (documentTypes, etc.)
3. Update size limits if needed
4. Add routes to `personal.ts` and `sharepoint.ts`

### Adding New Storage Provider:
1. Create new route file (e.g., `routes/googledrive.ts`)
2. Implement controller methods for new provider
3. Mount in `routes/index.ts`
4. Update documentation

### Adding New Endpoint:
1. Create new method in Controller
2. Add route in appropriate route file
3. Import and mount if needed

### Adding New Middleware:
1. Create file in `middleware/`
2. Export middleware function
3. Import and use in routes

## Current API Structure

The API now uses a clean grouped structure:
- `/api/upload/personal/*` - Personal OneDrive uploads
- `/api/upload/sharepoint/*` - SharePoint/Organizational uploads

All endpoints follow consistent patterns with clear separation between personal and organizational storage.