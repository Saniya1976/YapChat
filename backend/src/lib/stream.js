import dotenv from "dotenv";
dotenv.config(); // Loads .env from current working directory
import { StreamChat } from "stream-chat";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Check if env variables are available
console.log("Stream API Config Check:", {
  hasApiKey: !!apiKey,
  hasApiSecret: !!apiSecret,
  cwd: process.cwd()
});

if (!apiKey || !apiSecret) {
  console.error("❌ CRITICAL ERROR: STREAM_API_KEY or STREAM_API_SECRET is missing!");
}

// Initialize the Stream Chat client
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

/**
 * Creates or updates a Stream user
 * @param {Object} userData - Stream user data
 */
export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error(" Error creating/updating Stream user:", error.message);
    throw error;
  }
};


export const generateStreamToken = async (userId) => {
  try {
    const userIdStr = userId.toString();
    const token = streamClient.createToken(userIdStr); // Fixed: Added 'const' declaration
    return token; // Return the token
  } catch (error) {
    console.error("Error generating Stream token:", error.message);
    throw error; // Re-throw to handle in the calling function
  }
};