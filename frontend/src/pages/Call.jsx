import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
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
import { set } from 'mongoose';
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const Call = () => {
  const{id:callId}=useParams();
  const[client,setClient]=useState(null);
  const[call,setCall]=useState(null);
  const[isConnecting,setIsConnecting]=useState(false);

  const{authUser,isLoading}=useAuthUser();
  const{data:tokenData}=useQuery({
    queryKey:['stream-token'],
    queryFn:getStreamToken,
    enabled:!!authUser
  })
  useEffect(()=>{
    const initCall=async ()=>{
      if(!tokenData?.token || !authUser || !callId) return;
      try {
        const user={
        id:authUser._id,
        name:authUser.fullName,
        image:authUser.profilePic,
      }
      const videoClient=new StreamVideoClient(STREAM_API_KEY, tokenData.token);
      const callInstance=new videoClient.call("default", callId);
      await callInstance.join({create:true})
      console.log("joined Successfully");
      setClient(videoClient);
      setCall(callInstance);
        console.log(" Initializing Stream Video Client....")
      } catch (error) {
        console.error("Error initializing stream video:", error);
        toast.error("Failed to initialize call. Please try again later.");
      }finally{
        setIsConnecting(false);
      }
    }
    initCall()
  }, [tokenData, authUser, callId])
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
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

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default Call;

