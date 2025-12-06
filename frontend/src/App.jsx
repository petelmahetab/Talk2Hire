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

      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 80,
          left: 20,
          right: 20,
          zIndex: 9999,
        }}
        toastOptions={{
          // Default styles for all toasts
          style: {
            background: '#1e1e2d',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            padding: '16px 24px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            border: '1px solid #333',
            backdropFilter: 'blur(10px)',
          },
          duration: 5000,

          // Success Toast (All test cases passed!)
          success: {
            duration: 8000,
            icon: '🎉',
            style: {
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
            },
          },

          // Error Toast (Test cases failed / Time up)
          error: {
            duration: 7000,
            icon: '❌',
            style: {
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
            },
          },

          // Loading Toast
          loading: {
            duration: 10000,
            icon: '⏳',
          },

          // Custom toast (like End Interview confirmation)
          custom: {
            style: {
              background: '#0f172a',
              border: '1px solid #334155',
            },
          },
        }}
      />
    </>
  );
}

export default App;