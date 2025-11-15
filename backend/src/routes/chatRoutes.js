import express from "express";
import { getStreamToken, upsertUser } from "../controllers/chatController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/upsert-user", protectRoute, upsertUser)

export default router;
