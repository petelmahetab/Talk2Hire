// src/pages/MockInterviewSession.jsx
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import {
    Loader2Icon,
    PhoneOffIcon,
    BellRing,
    UserPlus,
    AlertCircle,
    Clock
} from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";
import axios from "axios";

function MockInterviewSession() {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const { user, isLoaded } = useUser();

    const [output, setOutput] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Interview data
    const [interview, setInterview] = useState(null);
    const [session, setSession] = useState(null);
    const [selectedProblem, setSelectedProblem] = useState(null);

    // Role from URL
    const urlRole = searchParams.get("role"); // 'interviewer' or 'candidate'
    const isInterviewer = urlRole === "interviewer";
    const isCandidate = urlRole === "candidate";

    // Candidate admission state (for interviewer)
    const [candidateWaiting, setCandidateWaiting] = useState(false);
    const [candidateAdmitted, setCandidateAdmitted] = useState(false);

    // Code editor state
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const [code, setCode] = useState("");

    // Stream setup
    const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
        session,
        loading,
        isInterviewer,
        isCandidate
    );

    // Get problem data
    const problemData = selectedProblem
        ? Object.values(PROBLEMS).find((p) => p.title === selectedProblem)
        : null;

    // Fetch interview and session data
    //   useEffect(() => {
    //     if (!isLoaded || !user) return;

    //     const fetchInterviewData = async () => {
    //       try {
    //         setLoading(true);
    //         console.log("🔍 Fetching interview data for room:", roomId);

    //         // Get interview details
    //         const interviewRes = await axios.get(
    //           `/api/interview-schedule/room/${roomId}`,
    //           { withCredentials: true }
    //         );

    //         if (interviewRes.data.success) {
    //           setInterview(interviewRes.data.interview);

    //           // Set initial problem if available
    //           if (interviewRes.data.interview.interviewType) {
    //             // Map interview type to a default problem
    //             const typeToProblems = {
    //               dsa: "Two Sum",
    //               "system-design": "Design URL Shortener",
    //               frontend: "Build Todo App",
    //               backend: "Design REST API",
    //               fullstack: "Two Sum",
    //               behavioral: "Tell Me About Yourself"
    //             };
    //             const defaultProblem = typeToProblems[interviewRes.data.interview.interviewType] || "Two Sum";
    //             setSelectedProblem(defaultProblem);
    //           }
    //         }

    //         // For interviewer: Show candidate waiting popup after 5 seconds
    //         if (isInterviewer) {
    //           setTimeout(() => {
    //             setCandidateWaiting(true);
    //           }, 5000);
    //         }

    //         setLoading(false);
    //       } catch (err) {
    //         console.error("❌ Failed to fetch interview:", err);
    //         setError(err.response?.data?.message || "Failed to load interview");
    //         setLoading(false);
    //       }
    //     };

    //     fetchInterviewData();
    //   }, [roomId, isLoaded, user, isInterviewer]);

    useEffect(() => {
        if (!isLoaded || !user) return;

        const joinRoom = async () => {
            try {
                setLoading(true);

                const res = await axios.post(
                    `/api/interview-schedule/room/${roomId}/join`,
                    {},
                    { withCredentials: true }
                );

                if (res.data.success) {
                    setInterview(res.data.interview);
                    setSession(res.data.session); // ← THIS IS THE MAGIC LINE

                    const typeToProblems = {
                        dsa: "Two Sum",
                        "system-design": "Design URL Shortener",
                        frontend: "Build Todo App",
                        backend: "Design REST API",
                        fullstack: "Two Sum",
                        behavioral: "Tell Me About Yourself"
                    };
                    const defaultProblem = typeToProblems[res.data.interview.interviewType] || "Two Sum";
                    setSelectedProblem(defaultProblem);

                    if (isInterviewer) {
                        setTimeout(() => setCandidateWaiting(true), 5000);
                    }
                }
            } catch (err) {
                console.error("Join failed:", err);
                setError(err.response?.data?.message || "Failed to join room");
            } finally {
                setLoading(false);
            }
        };

        joinRoom();
    }, [roomId, isLoaded, user, isInterviewer]);

    // Update code when problem or language changes
    useEffect(() => {
        if (problemData?.starterCode?.[selectedLanguage]) {
            setCode(problemData.starterCode[selectedLanguage]);
        } else {
            setCode("");
        }
    }, [problemData, selectedLanguage]);

    // Handle language change
    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setSelectedLanguage(newLang);
        setCode(problemData?.starterCode?.[newLang] || "");
        setOutput(null);
    };

    // Run code
    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput(null);
        const result = await executeCode(selectedLanguage, code);
        setOutput(result);
        setIsRunning(false);
    };

    // Change problem (interviewer only)
    const handleProblemChange = (newProblemTitle) => {
        setSelectedProblem(newProblemTitle);
        setOutput(null);
    };

    // End interview (interviewer only)
    const handleEndInterview = async () => {
        if (!confirm("End this mock interview?")) return;

        try {
            await axios.post(
                `/api/interview-schedule/room/${roomId}/complete`,
                {},
                { withCredentials: true }
            );
            navigate("/dashboard");
        } catch (err) {
            console.error("❌ Failed to end interview:", err);
            alert("Failed to end interview");
        }
    };

    // Admit candidate
    const admitCandidate = () => {
        setCandidateWaiting(false);
        setCandidateAdmitted(true);
    };

    // Loading state
    if (loading || !isLoaded) {
        return (
            <div className="h-screen flex items-center justify-center bg-base-100">
                <div className="text-center">
                    <Loader2Icon className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg">Loading interview room...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-base-100">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Unable to Join</h2>
                    <p className="text-base-content/70 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="btn btn-primary"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-base-100 flex flex-col">
            <Navbar />

            {/* CANDIDATE WAITING POPUP — ONLY FOR INTERVIEWER */}
            {candidateWaiting && isInterviewer && !candidateAdmitted && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-16 text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mx-auto mb-8 flex items-center justify-center animate-pulse">
                            <BellRing className="w-20 h-20 text-white" />
                        </div>
                        <h1 className="text-6xl font-black text-gray-900 mb-6">CANDIDATE READY!</h1>
                        <p className="text-4xl font-bold text-gray-700 mb-4">
                            {interview?.candidateName || "Candidate"}
                        </p>
                        <p className="text-2xl text-gray-600 mb-12">is waiting to join</p>
                        <div className="flex justify-center gap-10">
                            <button
                                onClick={() => setCandidateWaiting(false)}
                                className="px-16 py-8 bg-gray-300 text-gray-700 rounded-3xl font-bold text-2xl hover:bg-gray-400 transition"
                            >
                                Deny
                            </button>
                            <button
                                onClick={admitCandidate}
                                className="px-20 py-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl font-bold text-2xl hover:from-green-600 hover:to-emerald-700 flex items-center gap-6 shadow-2xl transition"
                            >
                                <UserPlus className="w-12 h-12" />
                                ADMIT & START
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal">
                    {/* LEFT PANEL */}
                    <Panel defaultSize={50} minSize={30}>
                        <PanelGroup direction="vertical">
                            {/* PROBLEM SECTION */}
                            <Panel defaultSize={50} minSize={20}>
                                <div className="h-full overflow-y-auto bg-base-200">
                                    <div className="p-6 bg-base-100 border-b border-base-300">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                {/* Interviewer: Can select problem */}
                                                {isInterviewer ? (
                                                    <div>
                                                        <select
                                                            className="select text-gray-400 w-full max-w-lg text-2xl font-bold bg-black"
                                                            value={selectedProblem || ""}
                                                            onChange={(e) => handleProblemChange(e.target.value)}
                                                        >
                                                            <option value="">Select Problem to Start...</option>
                                                            {Object.values(PROBLEMS).map((p) => (
                                                                <option key={p.title} value={p.title}>
                                                                    {p.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <p className="text-sm text-base-content/60 font-bold mt-2">
                                                            Interview Type:{" "}
                                                            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                                                {interview?.interviewType?.toUpperCase()}
                                                            </span>
                                                        </p>

                                                    </div>
                                                ) : (
                                                    /* Candidate: See selected problem */
                                                    <div>
                                                        <h1 className="text-3xl font-bold text-base-content">
                                                            {selectedProblem || "Waiting for interviewer to select problem..."}
                                                        </h1>
                                                        {problemData?.category && (
                                                            <p className="text-base-content/60 mt-2">{problemData.category}</p>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 mt-3 text-sm">
                                                    <span className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${isInterviewer ? 'bg-blue-500' : 'bg-green-500'}`} />
                                                        You are the {isInterviewer ? "Interviewer" : "Candidate"}
                                                    </span>
                                                    <span className="text-base-content/60">
                                                        Mock Interview Session
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right side controls */}
                                            <div className="flex items-center gap-4">
                                                {problemData && (
                                                    <span className={`badge badge-lg ${getDifficultyBadgeClass(problemData.difficulty)}`}>
                                                        {problemData.difficulty?.charAt(0).toUpperCase() + problemData.difficulty?.slice(1)}
                                                    </span>
                                                )}

                                                {/* Show interview time */}
                                                {interview && (
                                                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                                                        <Clock className="w-4 h-4" />
                                                        {interview.duration} min
                                                    </div>
                                                )}

                                                {/* End interview button (interviewer only) */}
                                                {isInterviewer && (
                                                    <button
                                                        onClick={handleEndInterview}
                                                        className="btn btn-error btn-sm gap-2"
                                                    >
                                                        <PhoneOffIcon className="w-4 h-4" />
                                                        End Interview
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* PROBLEM CONTENT */}
                                    {problemData ? (
                                        <div className="p-6 space-y-6">
                                            {/* Description */}
                                            <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
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
                                                <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                                                    <h2 className="text-xl font-bold mb-4">Examples</h2>
                                                    {problemData.examples.map((ex, i) => (
                                                        <div key={i} className="mb-4 p-4 bg-base-200 rounded-lg">
                                                            <p className="font-bold mb-2">Example {i + 1}:</p>
                                                            <pre className="text-sm bg-base-300 p-3 rounded overflow-x-auto">
                                                                <strong>Input:</strong> {ex.input}
                                                                {"\n"}
                                                                <strong>Output:</strong> {ex.output}
                                                                {ex.explanation && (
                                                                    <>
                                                                        {"\n"}
                                                                        <strong>Explanation:</strong> {ex.explanation}
                                                                    </>
                                                                )}
                                                            </pre>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Constraints */}
                                            {problemData.constraints && (
                                                <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                                                    <h2 className="text-xl font-bold mb-4">Constraints</h2>
                                                    <ul className="space-y-1 text-sm">
                                                        {problemData.constraints.map((c, i) => (
                                                            <li key={i}>• {c}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-64">
                                            <div className="text-center text-base-content/60">
                                                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                <p>
                                                    {isInterviewer
                                                        ? "Select a problem to begin the interview"
                                                        : "Waiting for interviewer to select a problem..."}
                                                </p>
                                            </div>
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
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center text-base-content/60">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                                        <p>Failed to connect to video call</p>
                                        <p className="text-sm mt-2">Please refresh the page</p>
                                    </div>
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

export default MockInterviewSession;