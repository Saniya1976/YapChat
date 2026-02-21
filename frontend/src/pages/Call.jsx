import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom' // Added useNavigate import
import useAuthUser from '../hooks/useAuthUser';
import { getStreamToken } from '../lib/api.js';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader.jsx";
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const Call = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const { authUser, isLoading } = useAuthUser();
  const { data: tokenData } = useQuery({
    queryKey: ['stream-token'],
    queryFn: getStreamToken,
    enabled: !!authUser
  });

  useEffect(() => {
    let videoClient;
    let callInstance;

    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) return;

      setIsConnecting(true);
      try {
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });

        console.log("Joined Successfully");
        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error initializing stream video:", error);
        toast.error("Failed to initialize call. Please try again later.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    // Cleanup function
    return () => {
      if (callInstance) {
        callInstance.leave().catch(console.error);
      }
      if (videoClient) {
        videoClient.disconnectUser().catch(console.error);
      }
    };
  }, [tokenData, authUser, callId]);

  if (isLoading || isConnecting) {
    return <PageLoader />;
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative w-full h-full">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate(); // Moved inside the component

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls onLeave={() => navigate("/")} />
    </StreamTheme>
  );
};

export default Call;