import { useState, useEffect, useCallback } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";
import { useUser } from "@clerk/clerk-react";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);
  const [videoInitComplete, setVideoInitComplete] = useState(false);  // NEW: Isolate video
  const [chatInitComplete, setChatInitComplete] = useState(false);  // NEW: Isolate chat

  // NEW: Stable init func (useCallback to prevent re-run)
  const initCall = useCallback(async () => {
    if (!session?.callId || session.status === "completed" || (!isHost && !isParticipant)) {
      console.log('useStreamClient early exit', { callId: session?.callId, status: session?.status, isHost, isParticipant });
      setIsInitializingCall(false);
      return;
    }

    console.log('Starting Stream init for callId:', session.callId);  // Log start

    let videoCall = null;
    let chatClientInstance = null;

    try {
      // Token fetch
      const { token } = await sessionApi.getStreamToken();
      const userId = user.id;
      const userName = user.fullName;
      const userImage = user.imageUrl;
      // Log token (no full for security)

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
      console.log('Video client initialized');

      videoCall = client.call("default", session.callId);
      await videoCall.join({ create: isHost });
      setCall(videoCall);
      setVideoInitComplete(true);  // NEW: Flip video flag
      console.log('Video call joined:', videoCall.id);

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
      console.log('Chat client connected');

      // Channel Watch
      const chatChannel = chatClientInstance.channel("messaging", session.callId);
      await chatChannel.watch();
      setChannel(chatChannel);
      setChatInitComplete(true);  // NEW: Flip chat flag
      console.log('Chat channel watched:', chatChannel.id);

      console.log('Full init complete');
    } catch (error) {
      console.error("Stream init error:", error);  // Detailed log
      toast.error("Failed to join video call: " + error.message);
    } finally {
      // NEW: Set false based on flags—video partial success unblocks spinner
      setIsInitializingCall(!(videoInitComplete && chatInitComplete));
    }
  }, [session?.callId, session?.status, isHost, isParticipant]);  // NEW: Narrow deps—no loadingSession/user (stable)

  useEffect(() => {
    if (session && !loadingSession) {
      initCall();  // Call stable func
    } else {
      setIsInitializingCall(false);  // Exit if no session
    }

    // Cleanup on unmount/re-init
    return () => {
      (async () => {
        try {
          if (call) await call.leave();
          if (chatClient) await chatClient.disconnectUser();
          await disconnectStreamClient();
          console.log('Cleanup complete');
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [initCall]);  // NEW: Dep on stable func only—no re-run loop

  // NEW: Log state changes for debug (remove after)
  useEffect(() => {
    console.log('useStreamClient state', { isInitializingCall, videoInitComplete, chatInitComplete, streamClient: !!streamClient, call: !!call, channel: !!channel });
  }, [isInitializingCall, videoInitComplete, chatInitComplete, streamClient, call, channel]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;