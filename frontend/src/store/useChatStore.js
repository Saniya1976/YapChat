import { create } from "zustand";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export const useChatStore = create((set, get) => ({
    client: null,
    channel: null,
    isConnecting: false,
    connectionError: null,

    connect: async (authUser, token, targetUserId) => {
        // If already connecting or already connected to the same person, skip
        const { client, channel, isConnecting, connectionError } = get();

        const channelId = [authUser._id, targetUserId].sort().join("-");

        if (isConnecting) return;
        if (!connectionError && client?.userID === authUser._id && channel?.id === channelId) {
            console.log("Already connected to this person");
            return;
        }

        try {
            set({ isConnecting: true, connectionError: null });
            console.log("ChatStore: Initializing connection...");

            const chatClient = StreamChat.getInstance(STREAM_API_KEY);

            // Connect user if not connected
            if (chatClient.userID !== authUser._id) {
                if (chatClient.userID) await chatClient.disconnectUser();

                await chatClient.connectUser(
                    {
                        id: authUser._id,
                        name: authUser.fullName,
                        image: authUser.profilePic,
                    },
                    token
                );
            }

            // Set up channel
            const currChannel = chatClient.channel("messaging", channelId, {
                members: [authUser._id, targetUserId],
            });

            await currChannel.watch();

            set({ client: chatClient, channel: currChannel, isConnecting: false });
            console.log("ChatStore: Connected successfully");
        } catch (error) {
            console.error("ChatStore: Connection error", error);
            set({ isConnecting: false, connectionError: error.message });
            toast.error("Chat connection failed. Please refresh.");
        }
    },

    disconnect: async () => {
        const { client } = get();
        if (client) {
            await client.disconnectUser();
            set({ client: null, channel: null });
        }
    }
}));
