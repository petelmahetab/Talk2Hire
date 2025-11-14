import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getStreamToken } from "../controllers/streamController.js";

const router = express.Router();

// POST is correct; Stream recommends POST
router.post("/token", protectRoute, getStreamToken);

export default router;
