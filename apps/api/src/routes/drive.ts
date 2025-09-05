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

// Get Google Drive folders
router.get(
  "/folders",
  async (req: Request & { user?: JwtUser }, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const accessToken = await getValidGoogleAccessToken(userId);
      if (!accessToken) {
        return res.status(400).json({ error: "No valid Google access token available" });
      }

      // Create Drive API client
      const drive = google.drive({ version: 'v3', auth: googleClient });
      googleClient.setCredentials({ access_token: accessToken });

      // Get parent folder ID from query parameter (defaults to root)
      const parentId = req.query.parentId as string || 'root';
      
      // Build query for folders in the specified parent
      let query = "mimeType='application/vnd.google-apps.folder' and trashed=false";
      if (parentId !== 'root') {
        query += ` and '${parentId}' in parents`;
      } else {
        query += " and parents in 'root'";
      }

      // Get Google Drive folders
      const response = await drive.files.list({
        q: query,
        fields: "files(id, name, createdTime, modifiedTime, size, owners, parents)",
        orderBy: "name"
      });

      const folders = response.data.files || [];
      
      // Get parent folder info if not root
      let parentFolder = null;
      if (parentId !== 'root') {
        try {
          const parentResponse = await drive.files.get({
            fileId: parentId,
            fields: "id, name, parents"
          });
          parentFolder = {
            id: parentResponse.data.id,
            name: parentResponse.data.name,
            parents: parentResponse.data.parents
          };
        } catch (error) {
          console.error('Error fetching parent folder:', error);
        }
      }
      
      // Format folders for frontend
      const formattedFolders = folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        createdTime: folder.createdTime,
        modifiedTime: folder.modifiedTime,
        size: folder.size || '0',
        owner: folder.owners?.[0]?.displayName || 'Unknown',
        hasParent: Boolean(folder.parents && folder.parents.length > 0),
        parents: folder.parents || []
      }));

      return res.json({ 
        success: true, 
        folders: formattedFolders,
        totalFolders: formattedFolders.length,
        currentParent: {
          id: parentId,
          name: parentFolder?.name || (parentId === 'root' ? 'My Drive' : 'Unknown'),
          parents: parentFolder?.parents || []
        }
      });
    } catch (error) {
      console.error('Error fetching Google Drive folders:', error);
      return res.status(500).json({ error: "Failed to fetch Google Drive folders" });
    }
  }
);

// Get Google Drive files (example of using refresh token)
router.get(
  "/files",
  async (req: Request & { user?: JwtUser }, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    try {
      const accessToken = await getValidGoogleAccessToken(userId);
      if (!accessToken) {
        return res.status(400).json({ error: "No valid Google access token available" });
      }

      // Example: Get Google Drive files (you'll need to implement the actual Drive API call)
      // For now, return a success message
      return res.json({ 
        success: true, 
        message: "Google Drive access token is valid and ready for API calls",
        tokenExpiresIn: "1 hour (auto-refreshed)"
      });
    } catch (error) {
      console.error('Error accessing Google Drive:', error);
      return res.status(500).json({ error: "Failed to access Google Drive" });
    }
  }
);

export default router;
