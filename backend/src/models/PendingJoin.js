import mongoose from "mongoose";

const pendingJoinSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  requesterClerkId: { type: String, required: true },
  requesterName: String,  // Temp from Clerk
  requesterEmail: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('PendingJoin', pendingJoinSchema);