import { requireAuth } from "@clerk/express";
import User from "../models/User.js";
import { clerkClient } from "../lib/clerk.js";  // Your new init file

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const auth = req.auth();
      const clerkId = auth.userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized" });

      let user = await User.findOne({ clerkId });
      
      // Fetch FULL Clerk user (real name/email/profile—no placeholders)
      const fullClerkUser = await clerkClient.users.getUser(clerkId);
      
      const email = fullClerkUser.emailAddresses[0]?.emailAddress || `${clerkId}@placeholder.local`;
      const name = fullClerkUser.fullName || 
                   `${fullClerkUser.firstName || ''} ${fullClerkUser.lastName || ''}`.trim() || 
                   email.split('@')[0] || 'Anonymous';
      const profileImage = fullClerkUser.imageUrl || '';

      console.log(`Clerk fetch for ${clerkId}: Name="${name}", Email="${email}", Image="${profileImage}"`);  // DEBUG: See real data

      if (!user) {
        // Create with real data
        user = await User.create({ 
          clerkId, 
          email, 
          name, 
          profileImage 
        });
        console.log(`New user created: ${name} (${email})`);
      } else if (user.name === 'Anonymous' || user.email.includes('@placeholder.local')) {
        // Force-sync existing placeholders
        user.name = name;
        user.email = email;
        user.profileImage = profileImage;
        await user.save();
        console.log(`Synced existing user ${clerkId} to real profile: ${name}`);
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];