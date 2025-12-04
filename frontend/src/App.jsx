// src/App.jsx
import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProblemsPage from "./pages/ProblemsPage";
import ProblemPage from "./pages/ProblemPage";
import SessionPage from "./pages/SessionPage";
import BookInterview from "./pages/BookInterview.jsx";
import MyInterviews from "./pages/MyInterviews.jsx";
import AvailabilitySettings from "./pages/AvailabilitySettings.jsx";
import RoomPage from "./pages/RoomPage.jsx";
import InterviewersPage from "./pages/InterviewersPage.jsx";
import InterviewJoin from "./pages/InterviewJoin.jsx"; // ← make sure filename matches exactly

function App() {
  const { isSignedIn, isLoaded } = useUser();

  // Prevent flash of unauthenticated content
  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/"
          element={!isSignedIn ? <HomePage /> : <Navigate to="/dashboard" replace />}
        />

        {/* ONLY THIS ONE IS ALLOWED WITHOUT LOGIN (email link) */}
        <Route path="/interview/join/:roomId" element={<InterviewJoin />} />

        {/* EVERYTHING ELSE REQUIRES AUTH */}
        <Route
          path="/*"
          element={
            isSignedIn ? (
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/problems" element={<ProblemsPage />} />
                <Route path="/problem/:id" element={<ProblemPage />} />
                <Route path="/session/:id" element={<SessionPage />} />
                <Route path="/book-interview/:interviewerId" element={<BookInterview />} />
                <Route path="/my-interviews" element={<MyInterviews />} />
                <Route path="/availability" element={<AvailabilitySettings />} />
                <Route path="/schedule" element={<AvailabilitySettings />} />
                <Route path="/room/:id" element={<RoomPage />} />
                <Route path="/interviewers" element={<InterviewersPage />} />

                {/* Catch-all fallback */}
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