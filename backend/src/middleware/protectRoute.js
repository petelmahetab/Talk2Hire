import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    console.log('🔒 protectRoute - Checking authentication');
    
    // Get the Clerk userId from the request (set by clerkMiddleware)
    const { userId } = req.auth || {};
    
    console.log('userId from req.auth:', userId);
    
    if (!userId) {
      console.log('❌ No userId found in request');
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Authentication required" 
      });
    }
    
    // Find user in DB by Clerk ID
    let user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      console.log('⚠️ User not found in DB, creating new user');
      
      // Optional: Auto-create user if not exists
      // Get user details from Clerk
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        
        user = await User.create({
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
          profileImage: clerkUser.imageUrl
        });
        
        console.log('✅ New user created:', user._id);
      } catch (error) {
        console.error('Error creating user:', error);
        return res.status(404).json({ 
          error: "User not found",
          message: "Please complete your profile" 
        });
      }
    }
    
    console.log('✅ User authenticated:', user._id);
    
    // Attach user to request
    req.user = user;
    req.userId = userId;
    
    next();
  } catch (error) {
    console.error('❌ Error in protectRoute middleware:', error);
    return res.status(500).json({ 
      error: "Internal Server Error",
      message: error.message 
    });
  }
};
