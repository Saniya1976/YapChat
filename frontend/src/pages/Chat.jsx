import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api.js";
import { useChatStore } from "../store/useChatStore.js";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader.jsx";
import CallButton from "../components/CallButton.jsx";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const { authUser } = useAuthUser();
  const { client, channel, isConnecting, connectionError, connect } = useChatStore();

  const { data: tokenData, isLoading: isTokenLoading, isError: isTokenError, error: tokenError } = useQuery({
    queryKey: ["streamToken", targetUserId],
    queryFn: () => getStreamToken(targetUserId),
    enabled: !!authUser && !!targetUserId,
    retry: false,
  });

  useEffect(() => {
    if (authUser && tokenData?.token && targetUserId) {
      connect(authUser, tokenData.token, targetUserId);
    }
  }, [authUser, tokenData?.token, targetUserId, connect]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (isTokenError || connectionError) {
    const errorMsg = tokenError?.response?.data?.error || connectionError || "Check your internet connection.";
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
        <div className="bg-error/10 p-4 rounded-lg">
          <p className="text-error font-semibold">Failed to connect to chat service.</p>
          <p className="text-sm opacity-70 mt-1">{errorMsg}</p>
        </div>
        <button onClick={() => window.location.reload()} className="btn btn-primary btn-sm">Try Again</button>
      </div>
    );
  }

  if (isTokenLoading || isConnecting || !client || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={client}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;