import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProblemsPage from "./pages/ProblemsPage";
import ProblemPage from "./pages/ProblemPage";
import SessionPage from "./pages/SessionPage";
import MockInterviewSession from "./pages/MockInterviewSession"; // ← ADD THIS
import InterviewJoin from "./pages/InterviewJoin";
import BookInterview from "./pages/BookInterview";
import MyInterviews from "./pages/MyInterviews";
import AvailabilitySettings from "./pages/AvailabilitySettings";
import RoomPage from "./pages/RoomPage";
import InterviewersPage from "./pages/InterviewersPage";

function App() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/"
          element={!isSignedIn ? <HomePage /> : <Navigate to="/dashboard" replace />}
        />

        {/* INTERVIEW JOIN (accessible via email link without login initially) */}
        <Route path="/interview/join/:roomId" element={<InterviewJoin />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/*"
          element={
            isSignedIn ? (
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/problems" element={<ProblemsPage />} />
                <Route path="/problem/:id" element={<ProblemPage />} />
                
                {/* Practice Session (old flow) */}
                <Route path="/session/:id" element={<SessionPage />} />
                
                {/* Mock Interview Session (new flow) - ADD THIS */}
                <Route path="/mock-interview/:roomId" element={<MockInterviewSession />} />
                
                <Route path="/book-interview/:interviewerId" element={<BookInterview />} />
                <Route path="/my-interviews" element={<MyInterviews />} />
                <Route path="/availability" element={<AvailabilitySettings />} />
                <Route path="/schedule" element={<AvailabilitySettings />} />
                <Route path="/room/:id" element={<RoomPage />} />
                <Route path="/interviewers" element={<InterviewersPage />} />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>

      <Toaster toastOptions={{ duration: 4000 }} />
    </>
  );
}

export default App;