import { requireAuth } from "@clerk/express";
import User from "../models/User.js";
import { clerkClient } from "../lib/clerk.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      // ✅ FIX: Get auth session properly
      const { userId } = req.auth();
      
      if (!userId) {
        console.warn('⚠️ No userId in auth');
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log(`🔐 Authenticating user: ${userId}`);

      // Find or create user in database
      let user = await User.findOne({ clerkId: userId });
      
      // Fetch full Clerk user data (real name/email/profile)
      let fullClerkUser;
      try {
        fullClerkUser = await clerkClient.users.getUser(userId);
      } catch (error) {
        console.error(`❌ Error fetching Clerk user ${userId}:`, error.message);
        return res.status(500).json({ message: "Failed to fetch user data" });
      }
      
      // Extract user info with fallbacks
      const email = fullClerkUser.emailAddresses?.[0]?.emailAddress || `${userId}@placeholder.local`;
      const name = fullClerkUser.fullName || 
                   `${fullClerkUser.firstName || ''} ${fullClerkUser.lastName || ''}`.trim() || 
                   email.split('@')[0] || 
                   'Anonymous';
      const profileImage = fullClerkUser.imageUrl || '';

      console.log(`✅ Clerk user data: Name="${name}", Email="${email}"`);

      // Create user if doesn't exist
      if (!user) {
        console.log(`📝 Creating new user in DB: ${name}`);
        user = await User.create({ 
          clerkId: userId, 
          email, 
          name, 
          profileImage 
        });
        console.log(`✅ New user created: ${name} (${email})`);
      } 
      // Update user if placeholder data exists
      else if (user.name === 'Anonymous' || user.email?.includes('@placeholder.local')) {
        console.log(`🔄 Syncing user ${userId} with real Clerk data`);
        user.name = name;
        user.email = email;
        user.profileImage = profileImage;
        await user.save();
        console.log(`✅ User synced: ${name}`);
      }
      
      // Attach user to request
      req.user = user;
      console.log(`✅ User attached to request: ${user.name} (${user._id})`);
      
      next();
    } catch (error) {
      console.error("❌ Error in protectRoute:", error.message);
      console.error("Stack:", error.stack);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },
];

export default protectRoute;