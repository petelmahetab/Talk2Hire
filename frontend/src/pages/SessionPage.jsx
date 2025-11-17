import { useUser, useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import ErrorBoundary from "../components/ErrorBoundary";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, PhoneOffIcon } from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import ProblemDescription from "../components/ProblemDescription";
import { setAuthHook } from "../lib/axios";
import toast from "react-hot-toast";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const auth = useAuth();
  
  console.log('📍 SessionPage mounted, id:', id);
  
  useEffect(() => {
    console.log('🔐 Setting auth hook');
    setAuthHook(auth);
  }, [auth]);

  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const { data: sessionData, isLoading: loadingSession, error: sessionError, refetch } = useSessionById(id);

  console.log('📊 Session data:', { hasSession: !!sessionData?.session, loadingSession });

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant
  );

  // find the problem data based on session problem title
  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  console.log('📚 Problem found:', !!problemData, 'Title:', session?.problem);

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      console.log('📝 Loading starter code for language:', selectedLanguage);
      const starterCode = problemData.starterCode[selectedLanguage];
      setCode(starterCode);
    }
  }, [problemData, selectedLanguage]);

  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;
    console.log('🔗 Auto-joining session...');
    joinSessionMutation.mutate(id, { onSuccess: refetch });
  }, [session, user, loadingSession, isHost, isParticipant, id, joinSessionMutation, refetch]);

  // FIXED: Add log for status check
  useEffect(() => {
    if (!session || loadingSession) return;
    
    console.log('🔍 Checking session status:', session.status);
    
    if (session.status === "completed") {
      console.log('✅ Session completed, redirecting to dashboard');
      navigate("/dashboard");
    }
  }, [session?.status, loadingSession, navigate]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
  };

  // FIXED: Sync cleanup before mutate, log onSuccess, force nav
  const handleEndSession = async () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      console.log('🛑 Ending session:', id);
      
      // NEW: Sync cleanup before backend call (no await hang)
      if (streamClient) {
        try {
          await streamClient.disconnectUser();
          console.log('🔌 Stream video disconnected');
        } catch (err) {
          console.error('Video cleanup error:', err);
        }
      }
      if (chatClient) {
        try {
          await chatClient.disconnectUser();
          console.log('💬 Chat disconnected');
        } catch (err) {
          console.error('Chat cleanup error:', err);
        }
      }

      endSessionMutation.mutate(id, { 
        onSuccess: async () => {
          console.log('✅ Backend end success, navigating to dashboard');
          await refetch();  // Optional—status update
          navigate("/dashboard", { replace: true });  // FIXED: replace: true avoids history loop
        },
        onError: (error) => {
          console.error('❌ End session error:', error);
          toast.error('Failed to end session');
        }
      });
    }
  };

  // FIXED: Add log to leave
  const handleLeaveSession = () => {
    if (confirm("Are you sure you want to leave this session?")) {
      console.log('👋 Leaving session, cleaning up...');
      
      // NEW: Cleanup before nav
      if (streamClient) streamClient.disconnectUser().catch(console.error);
      if (chatClient) chatClient.disconnectUser().catch(console.error);

      navigate("/dashboard", { replace: true });
    }
  };

  // LOADING STATE
  if (loadingSession) {
    return (
      <div className="h-screen bg-base-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-lg">Loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (!session) {
    return (
      <div className="h-screen bg-base-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="card bg-error/10 shadow-xl max-w-md">
            <div className="card-body">
              <h2 className="card-title text-error">Session Not Found</h2>
              <p className="text-base-content/70">
                {sessionError?.message || "The session could not be loaded."}
              </p>
              <div className="card-actions">
                <button onClick={() => navigate("/dashboard")} className="btn btn-primary btn-sm">
                  Back to Dashboard
                </button>
                <button onClick={() => refetch()} className="btn btn-outline btn-sm">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('✨ Rendering main content...');

  // SUCCESS STATE
  return (
    <div className="h-screen bg-base-100 flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - CODE & PROBLEM */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              {/* PROBLEM DESCRIPTION */}
              <Panel defaultSize={50} minSize={20}>
                {problemData ? (
                  <ProblemDescription 
                    problemData={problemData} 
                    session={session}
                    isHost={isHost}
                    isParticipant={isParticipant}
                    isEndingSession={endSessionMutation.isPending}
                    onEndSession={handleEndSession}
                    onLeaveSession={handleLeaveSession}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-base-200">
                    <div className="text-center">
                      <Loader2Icon className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                      <p className="text-base-content/60">Loading problem...</p>
                    </div>
                  </div>
                )}
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              {/* CODE EDITOR & OUTPUT */}
              <Panel defaultSize={50} minSize={20}>
                <PanelGroup direction="vertical">
                  {/* CODE EDITOR */}
                  <Panel defaultSize={70} minSize={30}>
                    {code ? (
                      <CodeEditorPanel
                        selectedLanguage={selectedLanguage}
                        code={code}
                        isRunning={isRunning}
                        onLanguageChange={handleLanguageChange}
                        onCodeChange={(value) => setCode(value)}
                        onRunCode={handleRunCode}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-base-300">
                        <div className="text-center">
                          <Loader2Icon className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                          <p className="text-base-content/60">Loading code editor...</p>
                        </div>
                      </div>
                    )}
                  </Panel>

                  <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                  {/* OUTPUT */}
                  <Panel defaultSize={30} minSize={15}>
                    <OutputPanel output={output} />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* RIGHT PANEL - VIDEO CALL */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-base-200 p-4 overflow-auto flex flex-col">
              {isInitializingCall ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="card bg-base-100 shadow-xl max-w-md">
                    <div className="card-body items-center text-center">
                      <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <PhoneOffIcon className="w-12 h-12 text-error" />
                      </div>
                      <h2 className="card-title text-2xl">Connection Failed</h2>
                      <p className="text-base-content/70">Unable to connect to the video call. Check console for logs.</p>
                      <button onClick={() => refetch()} className="btn btn-primary btn-sm mt-4">
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden">
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <VideoCallUI 
                        chatClient={chatClient} 
                        channel={channel} 
                        session={session} 
                        isHost={isHost} 
                      />
                    </StreamCall>
                  </StreamVideo>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default function SessionPageWithErrorBoundary() {
  return (
    <ErrorBoundary fallback={<div className="h-screen flex items-center justify-center text-error">Something went wrong—check console. <button onClick={() => window.location.reload()}>Reload</button></div>}>
      <SessionPage />
    </ErrorBoundary>
  );
}