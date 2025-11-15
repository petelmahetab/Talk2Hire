import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, PhoneOffIcon } from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // ✅ FIX #2: Changed from sessionData to session - data is already unwrapped
  const { data: session, isLoading: loadingSession, refetch } = useSessionById(id);

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  // ✅ FIX #3: session is now directly the session object, not nested
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant
  );

  console.log('🔍 SessionPage State:', {
    hasSession: !!session,
    loadingSession,
    isHost,
    isParticipant,
    callId: session?.callId,
    status: session?.status,
    isInitializingCall,
    hasStreamClient: !!streamClient,
    hasCall: !!call,
    hasChatClient: !!chatClient,
    hasChannel: !!channel,
  });

  // find the problem data based on session problem title
  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");

  // auto-join session if user is not already a participant and not the host
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;

    joinSessionMutation.mutate(id, { onSuccess: refetch });
  }, [session, user, loadingSession, isHost, isParticipant, id, joinSessionMutation, refetch]);

  // redirect the "participant" when session ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  // update code when problem loads or changes
  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

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

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      endSessionMutation.mutate(id, { onSuccess: () => navigate("/dashboard") });
    }
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        {loadingSession ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
              <p className="text-lg">Loading session...</p>
            </div>
          </div>
        ) : !session ? (
          <div className="h-full flex items-center justify-center">
            <div className="card bg-error/10 shadow-xl max-w-md">
              <div className="card-body">
                <h2 className="card-title text-error">Session Not Found</h2>
                <p className="text-base-content/70">
                  The session could not be loaded. Check the session ID and try again.
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
        ) : (
          <PanelGroup direction="horizontal">
            {/* LEFT PANEL - CODE EDITOR & PROBLEM DETAILS */}
            <Panel defaultSize={50} minSize={30}>
              <PanelGroup direction="vertical">
                {/* PROBLEM DESCRIPTION PANEL */}
                <Panel defaultSize={50} minSize={20}>
                  <div className="h-full overflow-y-auto bg-base-200">
                    {/* HEADER SECTION */}
                    <div className="p-6 bg-base-100 border-b border-base-300">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h1 className="text-3xl font-bold text-base-content">
                            {session?.problem || "Loading..."}
                          </h1>
                          {problemData?.category && (
                            <p className="text-base-content/60 mt-1">{problemData.category}</p>
                          )}
                          <p className="text-base-content/60 mt-2">
                            Host: {session?.host?.name || "Loading..."} •{" "}
                            {session?.participant ? 2 : 1}/2 participants
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`badge badge-lg ${getDifficultyBadgeClass(
                              session?.difficulty
                            )}`}
                          >
                            {session?.difficulty?.slice(0, 1).toUpperCase() +
                              session?.difficulty?.slice(1) || "Easy"}
                          </span>
                          {isHost && session?.status === "active" && (
                            <button
                              onClick={handleEndSession}
                              disabled={endSessionMutation.isPending}
                              className="btn btn-error btn-sm gap-2"
                            >
                              {endSessionMutation.isPending ? (
                                <Loader2Icon className="w-4 h-4 animate-spin" />
                              ) : (
                                <LogOutIcon className="w-4 h-4" />
                              )}
                              End Session
                            </button>
                          )}
                          {session?.status === "completed" && (
                            <span className="badge badge-ghost badge-lg">Completed</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* PROBLEM CONTENT */}
                    <div className="p-6 space-y-6">
                      {/* Problem Description */}
                      {problemData?.description && (
                        <div>
                          <h2 className="text-xl font-semibold mb-3 text-base-content">Description</h2>
                          <p className="text-base-content/80 leading-relaxed whitespace-pre-line">
                            {problemData.description}
                          </p>
                        </div>
                      )}

                      {/* Examples */}
                      {problemData?.examples && problemData.examples.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold mb-3 text-base-content">Examples</h2>
                          <div className="space-y-4">
                            {problemData.examples.map((example, index) => (
                              <div key={index} className="bg-base-300 p-4 rounded-lg">
                                <p className="font-mono text-sm text-base-content">
                                  <strong>Input:</strong> {example.input}
                                </p>
                                <p className="font-mono text-sm mt-2 text-base-content">
                                  <strong>Output:</strong> {example.output}
                                </p>
                                {example.explanation && (
                                  <p className="text-sm text-base-content/70 mt-2">
                                    <strong>Explanation:</strong> {example.explanation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Constraints */}
                      {problemData?.constraints && problemData.constraints.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold mb-3 text-base-content">Constraints</h2>
                          <ul className="list-disc list-inside space-y-1 text-base-content/80">
                            {problemData.constraints.map((constraint, index) => (
                              <li key={index} className="font-mono text-sm">{constraint}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Loading state */}
                      {!problemData && (
                        <div className="text-center py-8">
                          <Loader2Icon className="w-8 h-8 animate-spin mx-auto text-primary" />
                          <p className="text-base-content/60 mt-2">Loading problem details...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Panel>

                <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                <Panel defaultSize={50} minSize={20}>
                  <PanelGroup direction="vertical">
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

                    <Panel defaultSize={30} minSize={15}>
                      <OutputPanel output={output} />
                    </Panel>
                  </PanelGroup>
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

            {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
            <Panel defaultSize={50} minSize={30}>
              <div className="h-full bg-base-200 p-4 overflow-auto">
                {isInitializingCall ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                      <p className="text-lg">Connecting to video call...</p>
                    </div>
                  </div>
                ) : !streamClient || !call ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="card bg-base-100 shadow-xl max-w-md">
                      <div className="card-body items-center text-center">
                        <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                          <PhoneOffIcon className="w-12 h-12 text-error" />
                        </div>
                        <h2 className="card-title text-2xl">Connection Failed</h2>
                        <p className="text-base-content/70">Unable to connect to the video call. Check console for logs.</p>
                        <button onClick={() => refetch()} className="btn btn-primary btn-sm mt-4">Retry</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    <StreamVideo client={streamClient}>
                      <StreamCall call={call}>
                        <VideoCallUI chatClient={chatClient} channel={channel} session={session} isHost={isHost} />
                      </StreamCall>
                    </StreamVideo>
                  </div>
                )}
              </div>
            </Panel>
          </PanelGroup>
        )}
      </div>
    </div>
  );
}

export default SessionPage;