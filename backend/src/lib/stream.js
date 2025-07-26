import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Check if env variables are available
if (!apiKey || !apiSecret) {
  console.error("❌ Stream API Key or Secret is missing!");
  process.exit(1); // Exit the process if credentials are missing
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
    console.error("❌ Error creating/updating Stream user:", error.message);
    throw error;
  }
};

/**
 * Generates a Stream chat token for a user
 * @param {string} userId - The Stream user ID
 * @returns {string} - JWT token
 */
export const generateStreamToken = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to generate a token");
    }

    const token = streamClient.createToken(userId);
    return token;
  } catch (error) {
    console.error("❌ Error generating Stream token:", error.message);
    throw error;
  }
};
