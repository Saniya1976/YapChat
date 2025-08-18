import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Check if env variables are available
if (!apiKey || !apiSecret) {
  console.error(" Stream API Key or Secret is missing!");
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