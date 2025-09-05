import { Router, Request, Response } from "express";
import { getValidGoogleAccessToken } from "./google-oauth";
import { JwtUser } from "../middleware/auth";

const router = Router();


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
