// src/pages/SessionPage.jsx
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import {
  Loader2Icon,
  LogOutIcon,
  PhoneOffIcon,
  BellRing,
  UserPlus,
} from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";
import { useAuthAxios } from "../hooks/useAuthAxios";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isLoaded } = useUser();

  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // MOCK INTERVIEW STATES
  const [isMockInterview, setIsMockInterview] = useState(false);
  const [candidateWaiting, setCandidateWaiting] = useState(false);
  const [candidateName, setCandidateName] = useState("Candidate");
  const [urlRole, setUrlRole] = useState(null); // 'interviewer' or 'candidate'

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(id);
  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  // FINAL ROLE LOGIC (supports both old practice + new scheduled interviews)
  const isInterviewer =
    isHost ||
    urlRole === "interviewer" ||
    session?.hostClerkId === user?.id;

  const isCandidate = !isInterviewer && (isParticipant || urlRole === "candidate");

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isInterviewer,
    isCandidate
  );

  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");

  // DETECT IF THIS IS A SCHEDULED MOCK INTERVIEW + ROLE FROM URL
  useEffect(() => {
    if (!isLoaded) return;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(id);

    if (isUUID) {
      setIsMockInterview(true);

      const params = new URLSearchParams(window.location.search);
      const role = params.get("role");
      setUrlRole(role);

      if (role === "interviewer") {
        // Show candidate waiting popup after 5 seconds
        const timer = setTimeout(() => {
          setCandidateWaiting(true);
          setCandidateName("Candidate"); // You can improve this with real name from API later
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [id, isLoaded]);

  // Auto-join if not already in session
  useEffect(() => {
    if (!session || !user || loadingSession || !isLoaded) return;
    if (isInterviewer || isCandidate) return;

    joinSessionMutation.mutate(id, { onSuccess: () => refetch() });
  }, [session, user, loadingSession, isInterviewer, isCandidate, id, isLoaded]);

  // Redirect when session ends
  useEffect(() => {
    if (session?.status === "completed") {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  // Update code when problem or language changes
  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  // Interviewer not need to Choose any problem automatically it will selected.
  useEffect(() => {
    if (isInterviewer && !session?.problem && Object.values(PROBLEMS).length > 0) {
      const defaultProblem = "Two Sum"; 
      handleProblemChange(defaultProblem);
    }
  }, [isInterviewer, session?.problem]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(problemData?.starterCode?.[newLang] || "");
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
    if (confirm("End this interview?")) {
      endSessionMutation.mutate(id, { onSuccess: () => navigate("/dashboard") });
    }
  };

  const authAxios = useAuthAxios();

const handleProblemChange = async (newProblemTitle) => {
    try {
      console.log("🔄 Updating problem to:", newProblemTitle);
      
      // Use authAxios instead of axiosInstance
      await authAxios.patch(`/sessions/${id}`, { 
        problem: newProblemTitle 
      });
      
      console.log("✅ Problem updated successfully");
      refetch();
    } catch (err) {
      console.error("❌ Failed to update problem:", err);
      alert("Failed to update problem: " + (err.response?.data?.message || err.message));
    }
  };
  
  const admitCandidate = () => {
    setCandidateWaiting(false);
    // You can add real admission logic here later
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      {/* CANDIDATE WAITING POPUP — ONLY FOR INTERVIEWER */}
      {isMockInterview && candidateWaiting && isInterviewer && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-16 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mx-auto mb-8 flex items-center justify-center">
              <BellRing className="w-20 h-20 text-white" />
            </div>
            <h1 className="text-6xl font-black text-gray-900 mb-6">CANDIDATE READY!</h1>
            <p className="text-4xl font-bold text-gray-700 mb-4">{candidateName}</p>
            <p className="text-2xl text-gray-600 mb-12">is waiting to join</p>
            <div className="flex justify-center gap-10">
              <button className="px-16 py-8 bg-gray-300 text-gray-700 rounded-3xl font-bold text-2xl hover:bg-gray-400">
                Deny
              </button>
              <button
                onClick={admitCandidate}
                className="px-20 py-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl font-bold text-2xl hover:from-green-600 hover:to-emerald-700 flex items-center gap-6 shadow-2xl"
              >
                <UserPlus className="w-12 h-12" />
                ADMIT & START
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              {/* PROBLEM SECTION */}
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full overflow-y-auto bg-base-200">
                  <div className="p-6 bg-base-100 border-b border-base-300">
                    <div className="flex items-start justify-between">
                      <div>
                        {isInterviewer ? (
                          <select
                            className="select text-gray-500 w-full max-w-lg text-1xl font-bold bg-black"
                            value={session?.problem || ""}
                            onChange={(e) => handleProblemChange(e.target.value)}
                          >
                            <option value="">Select Problem to Start...</option>
                            {Object.values(PROBLEMS).map((p) => (
                              <option key={p.title} value={p.title}>
                                {p.title}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <h1 className="text-3xl font-bold text-base-content">
                            {session?.problem || "Waiting for interviewer to select problem..."}
                          </h1>
                        )}

                        {problemData?.category && (
                          <p className="text-base-content/60 mt-2">{problemData.category}</p>
                        )}
                        <p className="text-base-content/60 mt-3">
                          {isInterviewer ? "You are the Interviewer" : "You are the Candidate"} •{" "}
                          {session?.participant ? "2" : "1"}/2 online
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`badge badge-lg ${getDifficultyBadgeClass(session?.difficulty)}`}>
                          {session?.difficulty?.charAt(0).toUpperCase() + session?.difficulty?.slice(1) || "Medium"}
                        </span>

                        {isInterviewer && session?.status === "active" && (
                          <button onClick={handleEndSession} className="btn btn-error btn-sm gap-2">
                            {endSessionMutation.isPending ? (
                              <Loader2Icon className="w-4 h-4 animate-spin" />
                            ) : (
                              <PhoneOffIcon className="w-4 h-4" />
                            )}
                            End Session
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PROBLEM CONTENT (only shows when problem selected) */}
                  {problemData && (
                    <div className="p-6 space-y-6">
                      {/* Description */}
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border">
                        <h2 className="text-xl font-bold mb-4">Description</h2>
                        <div className="prose prose-sm max-w-none text-base-content/90">
                          <p>{problemData.description.text}</p>
                          {problemData.description.notes?.map((n, i) => (
                            <p key={i} className="mt-2">{n}</p>
                          ))}
                        </div>
                      </div>

                      {/* Examples */}
                      {problemData.examples?.length > 0 && (
                        <div className="bg-base-100 rounded-xl shadow-sm p-5 border">
                          <h2 className="text-xl font-bold mb-4">Examples</h2>
                          {problemData.examples.map((ex, i) => (
                            <div key={i} className="mb-4 p-4 bg-base-200 rounded-lg">
                              <p className="font-bold mb-2">Example {i + 1}:</p>
                              <pre className="text-sm bg-base-300 p-3 rounded">
                                <strong>Input:</strong> {ex.input}
                                <br />
                                <strong>Output:</strong> {ex.output}
                                {ex.explanation && (
                                  <>
                                    <br />
                                    <strong>Explanation:</strong>: {ex.explanation}
                                  </>
                                )}
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Constraints */}
                      {problemData.constraints && (
                        <div className="bg-base-100 rounded-xl shadow-sm p-5 border">
                          <h2 className="text-xl font-bold mb-4">Constraints</h2>
                          <ul className="space-y-1">
                            {problemData.constraints.map((c, i) => (
                              <li key={i} className="text-sm">• {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors" />

              {/* CODE EDITOR + OUTPUT */}
              <Panel defaultSize={50}>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={70}>
                    <CodeEditorPanel
                      selectedLanguage={selectedLanguage}
                      code={code}
                      isRunning={isRunning}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={setCode}
                      onRunCode={handleRunCode}
                    />
                  </Panel>
                  <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary" />
                  <Panel defaultSize={30}>
                    <OutputPanel output={output} />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary" />

          {/* RIGHT PANEL - VIDEO CALL */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-base-200 p-4">
              {isInitializingCall ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p>Connecting to video call...</p>
                  </div>
                </div>
              ) : !call ? (
                <div className="flex h-full items-center justify-center text-error">
                  <p>Failed to connect to video call</p>
                </div>
              ) : (
                <StreamVideo client={streamClient}>
                  <StreamCall call={call}>
                    <VideoCallUI chatClient={chatClient} channel={channel} />
                  </StreamCall>
                </StreamVideo>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default SessionPage;
