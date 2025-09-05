import { Router, Request, Response } from "express";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient } from "@prisma/client";
import { getValidGoogleAccessToken } from "./google-oauth";
import { JwtUser } from "../middleware/auth";

const prisma = new PrismaClient();

const router = Router();

// Google OAuth config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "";

const googleClient = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: GOOGLE_REDIRECT_URI,
});


// Get Gmail labels
router.get(
  "/labels",
  async (req: Request & { user?: JwtUser }, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const accessToken = await getValidGoogleAccessToken(userId);
      if (!accessToken) {
        return res.status(400).json({ error: "No valid Google access token available" });
      }

      // Create Gmail API client
      const gmail = google.gmail({ version: 'v1', auth: googleClient });
      googleClient.setCredentials({ access_token: accessToken });

      // Get Gmail labels
      const response = await gmail.users.labels.list({
        userId: 'me'
      });

      const labels = response.data.labels || [];
      
      // Get monitored folders for this user
      const monitoredFolders = await prisma.monitoredGmailFolder.findMany({
        where: { userId, isActive: true }
      });
      
      const monitoredFolderIds = new Set(monitoredFolders.map(f => f.folderId));
      
      // Format labels for frontend
      const formattedLabels = labels.map(label => ({
        id: label.id,
        name: label.name,
        type: label.type,
        messagesTotal: label.messagesTotal || 0,
        messagesUnread: label.messagesUnread || 0,
        threadsTotal: label.threadsTotal || 0,
        threadsUnread: label.threadsUnread || 0,
        isMonitored: monitoredFolderIds.has(label.id || '')
      }));

      return res.json({ 
        success: true, 
        labels: formattedLabels,
        totalLabels: formattedLabels.length
      });
    } catch (error) {
      console.error('Error fetching Gmail labels:', error);
      return res.status(500).json({ error: "Failed to fetch Gmail labels" });
    }
  }
);

// Save monitored Gmail folders
router.post(
  "/monitor",
  async (req: Request & { user?: JwtUser }, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const { selectedFolders } = req.body;
      
      if (!Array.isArray(selectedFolders)) {
        return res.status(400).json({ error: "selectedFolders must be an array" });
      }

      // First, deactivate all current monitored folders
      await prisma.monitoredGmailFolder.updateMany({
        where: { userId },
        data: { isActive: false }
      });

      // Then, create/activate the selected folders
      for (const folder of selectedFolders) {
        if (folder.id && folder.name) {
          await prisma.monitoredGmailFolder.upsert({
            where: {
              userId_folderId: {
                userId,
                folderId: folder.id
              }
            },
            update: {
              folderName: folder.name,
              isActive: true,
              updatedAt: new Date()
            },
            create: {
              userId,
              folderId: folder.id,
              folderName: folder.name,
              isActive: true
            }
          });
        }
      }

      return res.json({ 
        success: true, 
        message: "Monitored folders updated successfully",
        monitoredCount: selectedFolders.length
      });
    } catch (error) {
      console.error('Error saving monitored folders:', error);
      return res.status(500).json({ error: "Failed to save monitored folders" });
    }
  }
);

export default router;
