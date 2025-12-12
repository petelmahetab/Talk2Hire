import { requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      console.log("=== PROTECT ROUTE DEBUG ===");
      console.log("📍 Path:", req.path);
      console.log("🔐 req.auth object:", JSON.stringify(req.auth, null, 2));
      console.log("📋 Headers:", JSON.stringify(req.headers, null, 2));
      
      const clerkId = req.auth.userId;
      console.log("🆔 Extracted clerkId:", clerkId);
      
      if (!clerkId) {
        console.log("❌ No clerkId found - returning 401");
        return res.status(401).json({ message: "Unauthorized - invalid token" });
      }

      const user = await User.findOne({ clerkId });
      console.log("👤 User lookup result:", user ? `Found: ${user.email}` : "Not found");
      
      if (!user) {
        console.log("❌ User not in DB - returning 404");
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      console.log("✅ Auth successful, proceeding to route");
      next();
    } catch (error) {
      console.error("❌ Error in protectRoute middleware:", error);
      console.error("Stack:", error.stack);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },
];
