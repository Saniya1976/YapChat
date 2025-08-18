import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const { authUser } = useAuthUser();
  const [initStage, setInitStage] = useState('preparing');

  // Generate Stream token directly on frontend (for development only)
  const generateStreamToken = (userId) => {
    // WARNING: In production, this should be done on the backend
    // This is a development-only solution
    const client = StreamChat.getInstance(STREAM_API_KEY);
    return client.createToken(userId);
  };

  // Mock token fetch - replace with real API call if backend becomes available
  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken", authUser?._id],
    queryFn: async () => {
      if (!authUser?._id) {
        throw new Error('User ID is required for token generation');
      }
      
      // Generate token directly on frontend (temporary solution)
      const token = generateStreamToken(authUser._id);
      return { token };
    },
    enabled: !!authUser && !!authUser._id,
    retry: false, // Disable retries since we're generating locally
  });

  // Initialize chat
  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      try {
        if (!tokenData?.token || !authUser?._id || !targetUserId) {
          return;
        }

        if (chatClient && channel) {
          return;
        }

        setInitStage('connecting');
        
        const client = StreamChat.getInstance(STREAM_API_KEY);
        
        setInitStage('authenticating');
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        setInitStage('creating-channel');
        const channelId = [authUser._id, targetUserId].sort().join('-');
        const newChannel = client.channel('messaging', channelId, {
          members: [authUser._id, targetUserId],
        });

        await newChannel.watch();
        
        if (isMounted) {
          setInitStage('ready');
          setChatClient(client);
          setChannel(newChannel);
        }
        
      } catch (error) {
        console.error('Chat initialization failed:', error);
        if (isMounted) {
          setInitStage('error');
          toast.error(`Chat error: ${error.message}`);
        }
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [tokenData, authUser, targetUserId]);

  // Render states
  if (!authUser) {
    return <ChatLoader message="Authenticating user..." />;
  }

  if (!targetUserId) {
    return (
      <div className="flex items-center justify-center h-[93vh]">
        <div className="text-center p-4 bg-red-50 rounded-lg max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Invalid Chat URL</h3>
          <p className="text-red-500">No target user specified in URL</p>
        </div>
      </div>
    );
  }

  if (!STREAM_API_KEY) {
    return (
      <div className="flex items-center justify-center h-[93vh]">
        <div className="text-center p-4 bg-red-50 rounded-lg max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Configuration Error</h3>
          <p className="text-red-500 mb-3">Stream API key is not configured</p>
        </div>
      </div>
    );
  }

  if (tokenLoading) {
    return <ChatLoader message="Getting chat credentials..." />;
  }

  if (initStage === 'error') {
    return (
      <div className="flex items-center justify-center h-[93vh]">
        <div className="text-center p-4 bg-red-50 rounded-lg max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Chat Initialization Failed</h3>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!chatClient || !channel) {
    return <ChatLoader message="Initializing chat..." />;
  }

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput focus />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;