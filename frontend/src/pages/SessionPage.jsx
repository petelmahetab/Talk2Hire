import { useUser, useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import ErrorBoundary from "../components/ErrorBoundary";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Loader2 } from "lucide-react";
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

  // console.log('📊 Session data:', { 
  //   hasSession: !!sessionData?.session, 
  //   loadingSession,
  //   problemTitle: sessionData?.session?.problem 
  // });

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

  // ✅ FIXED: Look up problem by ID (which is now stored in the database)
  const problemData = (() => {
    if (!session?.problem) {
      console.log('❌ No problem in session');
      return null;
    }

    console.log('🔍 Looking for problem:', session.problem);

    // Primary lookup: by ID (e.g., "valid-palindrome")
    let found = PROBLEMS[session.problem];
    
    if (!found) {
      // Fallback: by id field
      found = Object.values(PROBLEMS).find((p) => p.id === session.problem);
    }

    if (!found) {
      // Backwards compatibility: by title (for old sessions)
      found = Object.values(PROBLEMS).find((p) => p.title === session.problem);
    }

    console.log('📚 Problem lookup result:', { 
      searchTerm: session.problem, 
      found: !!found,
      foundTitle: found?.title,
    });

    return found || null;
  })();

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      console.log('📝 Loading starter code for language:', selectedLanguage);
      const starterCode = problemData.starterCode[selectedLanguage];
      setCode(starterCode);
    } else {
      console.warn('⚠️ No starter code found for:', selectedLanguage);
      // Set a default empty template if no starter code
      setCode(`// ${problemData?.title || 'Problem'}\n// Write your solution here\n\n`);
    }
  }, [problemData, selectedLanguage]);

  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;
    console.log('🔗 Auto-joining session...');
    joinSessionMutation.mutate(id, { onSuccess: refetch });
  }, [session, user, loadingSession, isHost, isParticipant, id, joinSessionMutation, refetch]);

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
    const starterCode = problemData?.starterCode?.[newLang] || `// Write your ${newLang} solution here\n\n`;
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

  const handleEndSession = async () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      console.log('🛑 Ending session:', id);
      
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
          await refetch();
          navigate("/dashboard", { replace: true });
        },
        onError: (error) => {
          console.error('❌ End session error:', error);
          toast.error('Failed to end session');
        }
      });
    }
  };

  const handleLeaveSession = () => {
    if (confirm("Are you sure you want to leave this session?")) {
      console.log('👋 Leaving session, cleaning up...');
      
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
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-lg">Loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE - Enhanced with problem debugging
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

  // 🔧 ADDED: Problem not found error state
  if (!problemData && session) {
    return (
      <div className="h-screen bg-base-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="card bg-warning/10 shadow-xl max-w-md">
            <div className="card-body">
              <h2 className="card-title text-warning">Problem Not Found</h2>
              <p className="text-base-content/70">
                The problem "{session.problem}" could not be found in the problems database.
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-base-content/60">Debug Info</summary>
                <pre className="text-xs mt-2 p-2 bg-base-200 rounded overflow-auto">
                  Session Problem: {session.problem}
                  {'\n'}Available Problems: {Object.keys(PROBLEMS).join(', ')}
                </pre>
              </details>
              <div className="card-actions">
                <button onClick={() => navigate("/dashboard")} className="btn btn-primary btn-sm">
                  Back to Dashboard
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
                <ProblemDescription 
                  problemData={problemData} 
                  session={session}
                  isHost={isHost}
                  isParticipant={isParticipant}
                  isEndingSession={endSessionMutation.isPending}
                  onEndSession={handleEndSession}
                  onLeaveSession={handleLeaveSession}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              {/* CODE EDITOR & OUTPUT */}
              <Panel defaultSize={50} minSize={20}>
                <PanelGroup direction="vertical">
                  {/* CODE EDITOR */}
                  <Panel defaultSize={70} minSize={30}>
                    <CodeEditorPanel
                      selectedLanguage={selectedLanguage}
                      code={code}
                      isRunning={isRunning}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={(value) => setCode(value)}
                      onRunCode={handleRunCode}
                    />
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
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="card bg-base-100 shadow-xl max-w-md">
                    <div className="card-body items-center text-center">
                      <h2 className="card-title text-2xl">Connection Failed</h2>
                      <p className="text-base-content/70">Unable to connect to the video call.</p>
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
    <ErrorBoundary fallback={
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="card bg-error/10 shadow-xl max-w-md">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-error text-2xl mb-4">Something went wrong</h2>
            <p className="text-base-content/70 mb-4">Check console for details.</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Reload Page
            </button>
          </div>
        </div>
      </div>
    }>
      <SessionPage />
    </ErrorBoundary>
  );
}