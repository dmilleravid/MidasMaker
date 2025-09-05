import { Router, Request, Response } from "express";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { getValidGoogleAccessToken } from "./google-oauth";
import { JwtUser } from "../middleware/auth";

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
      
      // Format labels for frontend
      const formattedLabels = labels.map(label => ({
        id: label.id,
        name: label.name,
        type: label.type,
        messagesTotal: label.messagesTotal || 0,
        messagesUnread: label.messagesUnread || 0,
        threadsTotal: label.threadsTotal || 0,
        threadsUnread: label.threadsUnread || 0
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

export default router;
