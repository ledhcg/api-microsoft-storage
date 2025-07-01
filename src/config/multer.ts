// Multer configuration for file uploads

export const allowedMimeTypes = {
  // Images
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/tiff': '.tiff',
  
  // Microsoft Office Documents
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  
  // PDF
  'application/pdf': '.pdf',
  
  // Videos
  'video/mp4': '.mp4',
  'video/avi': '.avi',
  'video/quicktime': '.mov',
  'video/x-msvideo': '.avi',
  'video/x-ms-wmv': '.wmv',
  'video/webm': '.webm',
  'video/3gpp': '.3gp',
  'video/x-flv': '.flv',
  
  // Audio
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/aac': '.aac',
  'audio/x-m4a': '.m4a',
  
  // Text files
  'text/plain': '.txt',
  'text/csv': '.csv',
  'application/json': '.json',
  'application/xml': '.xml',
  
  // Archives
  'application/zip': '.zip',
  'application/x-rar-compressed': '.rar',
  'application/x-7z-compressed': '.7z'
};

// File type categories for specific upload endpoints
export const documentTypes = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/pdf',
  'text/plain',
  'text/csv'
];

// File size limits (in bytes)
export const fileSizeLimits = {
  general: 100 * 1024 * 1024, // 100MB for general files
  image: 10 * 1024 * 1024,    // 10MB for images
  document: 50 * 1024 * 1024, // 50MB for documents
  video: 200 * 1024 * 1024    // 200MB for videos
};