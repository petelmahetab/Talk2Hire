import { useState, useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";
import axiosInstance from "../lib/axios";
import { useUser } from "@clerk/clerk-react";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const { user } = useUser();
  
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  
  const hasInitialized = useRef(false);
  const isInitializing = useRef(false);

  useEffect(() => {
    console.log('🔧 useStreamClient conditions:', {
      hasUser: !!user,
      hasCallId: !!session?.callId,
      sessionStatus: session?.status,
      loadingSession,
      isHost,
      isParticipant,
      shouldProceed: !!user && !!session?.callId && session?.status !== "completed" && !loadingSession && (isHost || isParticipant),
    });

    if (!user) {
      console.log('useStreamClient: User not loaded yet');
      setIsInitializingCall(false);
      return;
    }

    if (!session?.callId || session.status === "completed" || loadingSession) {
      console.log('useStreamClient: Session not ready', { 
        hasCallId: !!session?.callId, 
        status: session?.status, 
        loadingSession 
      });
      setIsInitializingCall(false);
      return;
    }

    if (!isHost && !isParticipant) {
      console.log('useStreamClient: User is not host or participant');
      setIsInitializingCall(false);
      return;
    }

    if (hasInitialized.current === session.callId) {
      console.log('useStreamClient: Already initialized for this callId');
      setIsInitializingCall(false);
      return;
    }

    if (isInitializing.current) {
      console.log('useStreamClient: Already initializing');
      return;
    }

    isInitializing.current = true;
    console.log('Starting Stream init for callId:', session.callId);

    const initCall = async () => {
      let videoCall = null;
      let chatClientInstance = null;

      try {
        const userId = user.id;
        const userName = user.fullName || user.firstName || "Anonymous";
        const userImage = user.imageUrl;

        console.log('Upserting user to Stream:', { userId, userName });

        // ✅ FIX: Use axios instead of fetch
        try {
          const upsertResponse = await axiosInstance.post('/chat/upsert-user', {
            id: userId,
            name: userName,
            image: userImage,
          });
          console.log('✅ User upserted successfully');
        } catch (error) {
          console.warn('⚠️ Upsert failed, continuing:', error.message);
          // Don't fail the whole init if upsert fails
        }

        // Token fetch
        console.log('📡 Fetching Stream token...');
        const tokenResponse = await sessionApi.getStreamToken();
        const { token } = tokenResponse;
        console.log('✅ Token received, length:', token?.length);

        if (!token) {
          throw new Error('No token received from server');
        }

        // Video Client & Join
        console.log('🎥 Initializing video client...');
        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        setStreamClient(client);
        console.log('✅ Video client initialized');

        videoCall = client.call("default", session.callId);
        await videoCall.join({ create: isHost });
        console.log('✅ Video call joined');
        
        // Enable audio/video with proper error handling
        try {
          console.log('📹 Enabling camera...');
          await videoCall.camera.enable();
          console.log('✅ Camera enabled');
        } catch (error) {
          console.warn('⚠️ Camera enable failed:', error.message);
        }

        try {
          console.log('🎤 Enabling microphone...');
          await videoCall.microphone.enable();
          console.log('✅ Microphone enabled');
        } catch (error) {
          console.warn('⚠️ Microphone enable failed:', error.message);
          console.warn('Check browser permissions: Settings > Privacy > Microphone');
          toast.error('Microphone permission denied. Check browser settings.');
        }

        // Log device info
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioDevices = devices.filter(d => d.kind === 'audioinput');
          console.log('🎙️ Available audio devices:', audioDevices.map(d => d.label));
        } catch (e) {
          console.warn('Could not enumerate devices');
        }
        
        setCall(videoCall);

        // Chat Client
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        if (!apiKey) throw new Error("VITE_STREAM_API_KEY missing");
        
        console.log('💬 Initializing chat client...');
        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        setChatClient(chatClientInstance);
        console.log('✅ Chat client connected');

        // Channel Watch
        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        setChannel(chatChannel);
        console.log('✅ Chat channel watched');

        hasInitialized.current = session.callId;
        console.log('🎉 Stream initialization complete!');
        
      } catch (error) {
        console.error("❌ Stream init error:", error);
        console.error("Error stack:", error.stack);
        toast.error("Failed to join video call: " + error.message);
        
        // Clean up on error
        if (videoCall) {
          try { await videoCall.leave(); } catch (e) { /* ignore */ }
        }
        if (chatClientInstance) {
          try { await chatClientInstance.disconnectUser(); } catch (e) { /* ignore */ }
        }
        
        setStreamClient(null);
        setCall(null);
        setChatClient(null);
        setChannel(null);
      } finally {
        isInitializing.current = false;
        setIsInitializingCall(false);
      }
    };

    initCall();

    return () => {
      if (!hasInitialized.current || hasInitialized.current !== session?.callId) return;
      
      console.log('🧹 Cleaning up Stream connections for callId:', hasInitialized.current);
      
      const currentCall = call;
      const currentChatClient = chatClient;
      
      hasInitialized.current = false;
      
      (async () => {
        try {
          if (currentCall) {
            await currentCall.leave();
            console.log('✅ Left video call');
          }
          if (currentChatClient) {
            await currentChatClient.disconnectUser();
            console.log('✅ Disconnected chat client');
          }
          await disconnectStreamClient();
          console.log('✅ Cleanup complete');
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session?.callId, session?.status, isHost, isParticipant, user?.id, loadingSession]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;