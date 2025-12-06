// src/pages/MockInterviewSession.jsx
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState, useRef } from "react";
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
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

function MockInterviewSession() {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const { user, isLoaded } = useUser();

    const [output, setOutput] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [interview, setInterview] = useState(null);
    const [session, setSession] = useState(null);
    const [selectedProblem, setSelectedProblem] = useState(null);

    const urlRole = searchParams.get("role");
    const isInterviewer = urlRole === "interviewer";
    const isCandidate = urlRole === "candidate";

    const [candidateWaiting, setCandidateWaiting] = useState(false);
    const [candidateAdmitted, setCandidateAdmitted] = useState(false);

    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const [code, setCode] = useState("");

    // Timer state – shared start time
    const [timeLeft, setTimeLeft] = useState(null);           // seconds remaining
    const [interviewStartedAt, setInterviewStartedAt] = useState(null); // timestamp when candidate was admitted
    const timerIntervalRef = useRef(null);

    const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
        session, loading, isInterviewer, isCandidate
    );

    const problemData = selectedProblem
        ? Object.values(PROBLEMS).find((p) => p.title === selectedProblem)
        : null;

    // ──────────────────────────────────────────────────────────────
    // Join room (only fetch data + show waiting popup for interviewer)
    // ──────────────────────────────────────────────────────────────
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
                    setSession(res.data.session);

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

    // ──────────────────────────────────────────────────────────────
    // When interviewer admits candidate → start timer for BOTH sides
    // ──────────────────────────────────────────────────────────────
    const admitCandidate = () => {
        setCandidateWaiting(false);
        setCandidateAdmitted(true);

        const durationSeconds = (interview?.duration || 45) * 60;
        const startTimestamp = Date.now();                 // exact moment candidate is admitted
        setInterviewStartedAt(startTimestamp);
        setTimeLeft(durationSeconds);
    };

    // ──────────────────────────────────────────────────────────────
    // Timer countdown (runs on both interviewer & candidate)
    // ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!interviewStartedAt || timeLeft === null) return;

        timerIntervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - interviewStartedAt) / 1000);
            const remaining = Math.max(0, (interview?.duration || 45) * 60 - elapsed);

            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timerIntervalRef.current);
                handleTimeUp();
            }
        }, 500);

        return () => clearInterval(timerIntervalRef.current);
    }, [interviewStartedAt, interview?.duration]);

    const handleTimeUp = async () => {
        toast.error("Time's up! Interview ended automatically.", {
            duration: 8000,
            icon: "Time Over",
        });

        try {
            await axios.post(`/api/interview-schedule/room/${roomId}/complete`, {}, { withCredentials: true });
        } catch (err) {
            console.error("Auto-end failed:", err);
        }
        setTimeout(() => navigate("/dashboard"), 3000);
    };

    const formatTime = (seconds) => {
        const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
        const secs = String(seconds % 60).padStart(2, "0");
        return `${mins}:${secs}`;
    };

    // ──────────────────────────────────────────────────────────────
    // Code execution + test-case toast (only for candidate)
    // ──────────────────────────────────────────────────────────────
    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput(null);
        const result = await executeCode(selectedLanguage, code);
        setOutput(result);
        setIsRunning(false);

        if (problemData?.testCases && problemData.testCases.length > 0 && isCandidate) {
            let passed = 0;
            const total = problemData.testCases.length;

            problemData.testCases.forEach(tc => {
                if ((result?.output || "").trim() === tc.expectedOutput.trim()) passed++;
            });

            if (passed === total) {
                confetti({ particleCount: 180, spread: 70, origin: { y: 0.6 } });
                toast.success(`Congratulations! All ${total} test cases passed!`, {
                    duration: 8000,
                    style: { background: "linear-gradient(135deg, #10b981, #059669)", color: "white", fontWeight: "bold" },
                });
            } else {
                const failed = total - passed;
                toast.error(`${failed} test case${failed > 1 ? "s" : ""} failed. Keep trying!`, { duration: 7000 });
            }
        }
    };

    // ──────────────────────────────────────────────────────────────
    // End interview toast (unchanged – only interviewer sees the button)
    // ──────────────────────────────────────────────────────────────
    const handleEndInterview = () => {
        toast(
            (t) => (
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-2xl max-w-sm">
                    <h3 className="text-xl font-bold mb-4">End Interview?</h3>
                    <p className="text-sm opacity-90 mb-6">This will close the session for both participants.</p>
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => toast.dismiss(t.id)} className="px-5 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                toast.loading("Ending interview...");
                                try {
                                    await axios.post(`/api/interview-schedule/room/${roomId}/complete`, {}, { withCredentials: true });
                                    toast.success("Interview ended successfully!");
                                    setTimeout(() => navigate("/dashboard"), 1500);
                                } catch {
                                    toast.error("Failed to end interview");
                                }
                            }}
                            className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 font-medium transition"
                        >
                            End Now
                        </button>
                    </div>
                </div>
            ),
            { duration: Infinity }
        );
    };

    // ──────────────────────────────────────────────────────────────
    // Rest of your original UI (unchanged)
    // ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (problemData?.starterCode?.[selectedLanguage]) {
            setCode(problemData.starterCode[selectedLanguage]);
        } else {
            setCode("");
        }
    }, [problemData, selectedLanguage]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setSelectedLanguage(newLang);
        setCode(problemData?.starterCode?.[newLang] || "");
        setOutput(null);
    };

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

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-base-100">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Unable to Join</h2>
                    <p className="text-base-content/70 mb-6">{error}</p>
                    <button onClick={() => navigate("/dashboard")} className="btn btn-primary">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-base-100 flex flex-col">
            <Navbar />

            {/* LIVE TIMER – visible to both */}
            {timeLeft !== null && (
                <div className="absolute top-20 right-6 z-50 bg-black/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl border border-red-500/30">
                    <div className={`flex items-center gap-3 text-2xl font-bold ${timeLeft < 300 ? "text-red-400 animate-pulse" : ""}`}>
                        <Clock className="w-8 h-8" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
            )}

            {/* Candidate waiting popup */}
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
                            <button onClick={() => setCandidateWaiting(false)} className="px-16 py-8 bg-gray-300 text-gray-700 rounded-3xl font-bold text-2xl hover:bg-gray-400 transition">
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

            {/* ────── YOUR ORIGINAL LAYOUT (unchanged) ────── */}
            <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal">
                    {/* LEFT PANEL */}
                    <Panel defaultSize={50} minSize={30}>
                        <PanelGroup direction="vertical">
                            <Panel defaultSize={50} minSize={20}>
                                <div className="h-full overflow-y-auto bg-base-200">
                                    <div className="p-6 bg-base-100 border-b border-base-300">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                {isInterviewer ? (
                                                    <div>
                                                        <select
                                                            className="select text-gray-400 w-full max-w-lg text-2xl font-bold bg-black"
                                                            value={selectedProblem || ""}
                                                            onChange={(e) => setSelectedProblem(e.target.value)}
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
                                                    <span className="text-base-content/60">Mock Interview Session</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {problemData && (
                                                    <span className={`badge badge-lg ${getDifficultyBadgeClass(problemData.difficulty)}`}>
                                                        {problemData.difficulty?.charAt(0).toUpperCase() + problemData.difficulty?.slice(1)}
                                                    </span>
                                                )}
                                                {timeLeft !== null && (
                                                    <div className="flex items-center gap-2 text-lg font-bold text-primary">
                                                        <Clock className="w-5 h-5" />
                                                        {formatTime(timeLeft)}
                                                    </div>
                                                )}
                                                {isInterviewer && (
                                                    <button onClick={handleEndInterview} className="btn btn-error btn-sm gap-2">
                                                        <PhoneOffIcon className="w-4 h-4" />
                                                        End Interview
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Problem description, examples, constraints – unchanged */}
                                    {problemData ? (
                                        <div className="p-6 space-y-6">
                                            <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                                                <h2 className="text-xl font-bold mb-4">Description</h2>
                                                <div className="prose prose-sm max-w-none text-base-content/90">
                                                    <p>{problemData.description.text}</p>
                                                    {problemData.description.notes?.map((n, i) => (
                                                        <p key={i} className="mt-2">{n}</p>
                                                    ))}
                                                </div>
                                            </div>

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