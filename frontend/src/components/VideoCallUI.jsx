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
import { useMutation, useQueryClient } from "@tanstack/react-query";  // If error, comment out & use fallback below
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel, session, isHost }) {  // isHost prop from parent (true for host modal)
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);
  const queryClient = useQueryClient();

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ pendingId }) =>
      fetch(`/api/sessions/${session._id}/approve/${pendingId}`, { method: 'POST' }).then(r => r.json()),
    onSuccess: () => { 
      setPendingRequest(null); 
      alert("Approved—streams updating! Candidate joining now.");  // Native fallback
      if (queryClient) queryClient.invalidateQueries(['activeSessions']);
    },
    onError: (err) => alert(`Approval Failed: ${err.message}`),
  });

  // Fallback if TanStack error (uncomment mutationFn above, comment this)
  // const handleApprove = async (pendingId) => {
  //   try {
  //     await fetch(`/api/sessions/${session._id}/approve/${pendingId}`, { method: 'POST' });
  //     setPendingRequest(null);
  //     alert("Approved—streams updating!");
  //   } catch (err) {
  //     alert(`Approval Failed: ${err.message}`);
  //   }
  // };

  // Listen for join requests
  useEffect(() => {
    if (!channel) return;

    const unsubscribe = channel.on('message.new', (event) => {
      if (event.message.type === 'join_request') {
        const requesterName = event.message.text.split('from ')[1]?.split('—')[0]?.trim() || 'Unknown';
        setPendingRequest({ 
          name: requesterName, 
          pendingId: event.message.custom.pendingId,
          requesterClerkId: event.message.custom.requesterClerkId 
        });
        alert(`${requesterName} wants to join—check pop-up!`);
      }
    });

    channel.watch();

    return () => unsubscribe();
  }, [channel]);

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

        <div className="flex-1 bg-base-300 rounded-lg overflow-hidden relative">
          <SpeakerLayout />  {/* Distinct streams update here post-approve */}
        </div>

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

      {/* Approval Pop-Up Modal (Host-Only via isHost prop) */}
      {pendingRequest && isHost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Join Request</h3>
            <p className="mb-4">👤 {pendingRequest.name} wants to join your interview room.</p>
            <div className="flex gap-3 justify-end">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPendingRequest(null)}  // Deny
              >
                <XCircleIcon className="size-4 mr-1" /> Deny
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => approveMutation.mutate({ pendingId: pendingRequest.pendingId })}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? <Loader2Icon className="size-4 mr-1 animate-spin" /> : <CheckIcon className="size-4 mr-1" />}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoCallUI;