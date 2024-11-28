import dotenv from "dotenv";

dotenv.config();

export const MICROSOFT_CONFIG = {
  clientId: process.env.MICROSOFT_CLIENT_ID || "",
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
  tenantId: process.env.MICROSOFT_TENANT_ID || "",
  driveId: process.env.MICROSOFT_DRIVE_ID || "",
};
