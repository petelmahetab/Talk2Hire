import {
  CallControls,
  CallingState,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Loader2Icon, MessageSquareIcon, UsersIcon, XIcon, CheckIcon, XCircleIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel, session, isHost }) {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);
  const queryClient = useQueryClient();

  // ✅ FIX: Add safety check for session
  if (!session) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-error">Session data not available</p>
        </div>
      </div>
    );
  }

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ pendingId }) =>
      fetch(`/api/sessions/${session._id}/approve/${pendingId}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    onSuccess: () => {
      console.log('✅ Join request approved');
      setPendingRequest(null);
      alert("Approved—candidate joining now.");
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
      }
    },
    onError: (err) => {
      console.error('❌ Approval failed:', err);
      alert(`Approval Failed: ${err.message}`);
    },
  });

  // ✅ FIX: Proper error handling for channel listener
  useEffect(() => {
    if (!channel) {
      console.log('⚠️ Channel not available yet');
      return;
    }

    const handleMessageNew = (event) => {
      try {
        if (event.message?.type === 'join_request') {
          const text = event.message.text || '';
          const requesterName = text.split('from ')[1]?.split('—')[0]?.trim() || 'Unknown';
          const pendingId = event.message.custom?.pendingId;
          const requesterClerkId = event.message.custom?.requesterClerkId;

          if (!pendingId) {
            console.warn('⚠️ No pendingId in join request');
            return;
          }

          console.log('📬 Join request received from:', requesterName);
          setPendingRequest({
            name: requesterName,
            pendingId: pendingId,
            requesterClerkId: requesterClerkId,
          });
          
          // Only show alert if host
          if (isHost) {
            alert(`${requesterName} wants to join—check pop-up!`);
          }
        }
      } catch (error) {
        console.error('❌ Error handling message:', error);
      }
    };

    // Subscribe to channel events
    const unsubscribe = channel.on('message.new', handleMessageNew);

    // Watch channel
    channel.watch().catch(err => {
      console.error('❌ Error watching channel:', err);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [channel, isHost]);

  // ✅ FIX: Handle joining state
  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-3 relative str-video">
      <div className="flex-1 flex flex-col gap-3">
        {/* Participant Count Header */}
        <div className="flex items-center justify-between gap-2 bg-base-100 p-3 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            <span className="font-semibold">
              {participantCount} {participantCount === 1 ? "participant" : "participants"}
            </span>
          </div>
          {chatClient && channel && (
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`btn btn-sm gap-2 ${isChatOpen ? "btn-primary" : "btn-ghost"}`}
              title={isChatOpen ? "Hide chat" : "Show chat"}
            >
              <MessageSquareIcon className="size-4" />
              Chat
            </button>
          )}
        </div>

        {/* Video Stream */}
        <div className="flex-1 bg-base-300 rounded-lg overflow-hidden relative">
          <SpeakerLayout />
        </div>

        {/* Call Controls */}
        <div className="bg-base-100 p-3 rounded-lg shadow flex justify-center">
          <CallControls onLeave={() => navigate("/dashboard")} />
        </div>
      </div>

      {/* CHAT SECTION */}
      {chatClient && channel && (
        <div
          className={`flex flex-col rounded-lg shadow overflow-hidden bg-[#272a30] transition-all duration-300 ease-in-out ${
            isChatOpen ? "w-80 opacity-100" : "w-0 opacity-0"
          }`}
        >
          {isChatOpen && (
            <>
              <div className="bg-[#1c1e22] p-3 border-b border-[#3a3d44] flex items-center justify-between">
                <h3 className="font-semibold text-white">Session Chat</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close chat"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden stream-chat-dark">
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              </div>
            </>
          )}
        </div>
      )}

      {/* Approval Pop-Up Modal (Host-Only) */}
      {pendingRequest && isHost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Join Request</h3>
            <p className="mb-4">👤 {pendingRequest.name} wants to join your interview room.</p>
            <div className="flex gap-3 justify-end">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPendingRequest(null)}
                disabled={approveMutation.isPending}
              >
                <XCircleIcon className="size-4 mr-1" /> Deny
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => approveMutation.mutate({ pendingId: pendingRequest.pendingId })}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? (
                  <>
                    <Loader2Icon className="size-4 mr-1 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="size-4 mr-1" />
                    Approve
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoCallUI;