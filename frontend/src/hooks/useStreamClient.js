import { useState, useEffect, useCallback, useRef } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";
import { useUser } from "@clerk/clerk-react";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const { user } = useUser();
  
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  
  // Use ref to track if we've already initialized
  const hasInitialized = useRef(false);
  const isInitializing = useRef(false);

  useEffect(() => {
    // Debug: Log all the conditions
    console.log('🔧 useStreamClient conditions:', {
      hasUser: !!user,
      hasCallId: !!session?.callId,
      sessionStatus: session?.status,
      loadingSession,
      isHost,
      isParticipant,
      shouldProceed: !!user && !!session?.callId && session?.status !== "completed" && !loadingSession && (isHost || isParticipant),
    });

    // Early exit conditions
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

    // Prevent duplicate initialization for same callId
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

        // Upsert user to Stream backend
        const upsertResponse = await fetch('/api/chat/upsert-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userId,
            name: userName,
            image: userImage,
          }),
        });

        if (!upsertResponse.ok) {
          throw new Error(`Failed to upsert user: ${upsertResponse.status}`);
        }

        console.log('✅ User upserted successfully');

        // Token fetch
        const { token } = await sessionApi.getStreamToken();
        console.log('✅ Token received, length:', token?.length);

        // Video Client & Join
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
        
        // Enable audio/video
        try {
          await videoCall.camera.enable();
          await videoCall.microphone.enable();
          console.log('✅ Audio/Video enabled');
        } catch (error) {
          console.warn('⚠️ Could not enable media (might need manual permission):', error.message);
        }
        
        setCall(videoCall);

        // Chat Client
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        if (!apiKey) throw new Error("VITE_STREAM_API_KEY missing");
        
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

        hasInitialized.current = session.callId; // Store callId to prevent re-init
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

    // Cleanup function - only runs on unmount or callId change
    return () => {
      if (!hasInitialized.current || hasInitialized.current !== session?.callId) return;
      
      console.log('🧹 Cleaning up Stream connections for callId:', hasInitialized.current);
      
      // Capture current values before cleanup
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
  }, [session?.callId, session?.status, isHost, isParticipant, user?.id, loadingSession, call, chatClient]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;