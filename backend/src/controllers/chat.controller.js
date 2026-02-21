import { generateStreamToken, upsertStreamUser } from '../lib/stream.js';
import User from '../models/User.js';

export async function getStreamToken(req, res) {
  try {
    const { targetUserId } = req.query;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Sync user with Stream as a best effort
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic || ""
      });
    } catch (err) {
      console.error("Non-critical: Failed to upsert user:", err.message);
    }

    // NEW: Also sync target user if provided
    if (targetUserId) {
      try {
        const target = await User.findById(targetUserId);
        if (target) {
          await upsertStreamUser({
            id: target._id.toString(),
            name: target.fullName,
            image: target.profilePic || ""
          });
        }
      } catch (err) {
        console.error("Non-critical: Failed to upsert target user:", err.message);
      }
    }

    const token = await generateStreamToken(req.user._id);
    console.log("Stream token generated successfully for user:", user._id);
    res.status(200).json({ token });
  } catch (error) {
    console.error("CRITICAL error in getStreamToken controller:");
    console.error("- Error message:", error.message);
    if (error.stack) console.error("- Stack trace:", error.stack);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
