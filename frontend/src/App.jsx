import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import axiosInstance from "./lib/axios";

// Pages
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProblemsPage from "./pages/ProblemsPage";
import ProblemPage from "./pages/ProblemPage";
import SessionPage from "./pages/SessionPage";
import MockInterviewSession from "./pages/MockInterviewSession";
import InterviewJoin from "./pages/InterviewJoin";
import BookInterview from "./pages/BookInterview";
import MyInterviews from "./pages/MyInterviews";
import AvailabilitySettings from "./pages/AvailabilitySettings";
import RoomPage from "./pages/RoomPage";
import InterviewersPage from "./pages/InterviewersPage";

function App() {
  const { isSignedIn, isLoaded, user } = useUser();

  // ✅ CRITICAL: Setup global auth interceptor
  useEffect(() => {
    if (!isSignedIn || !user) {
      console.log("⏭️ User not signed in, skipping auth setup");
      return;
    }

    console.log("🔐 Setting up global auth interceptor for user:", user.id);

    // Add request interceptor to inject auth token
    const requestInterceptor = axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          // ✅ TRY MULTIPLE METHODS to get token
          let token = null;
          
          // Method 1: Direct from window.Clerk (most reliable)
          if (window.Clerk?.session) {
            token = await window.Clerk.session.getToken();
            console.log("✅ Got token from window.Clerk.session");
          }
          
          // Method 2: Fallback to user object
          if (!token && typeof user.getToken === 'function') {
            token = await user.getToken();
            console.log("✅ Got token from user.getToken()");
          }
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("✅ Auth token added to request:", config.url);
          } else {
            console.error("⚠️ No token available for request:", config.url);
          }
        } catch (error) {
          console.error("❌ Failed to get auth token:", error);
        }
        return config;
      },
      (error) => {
        console.error("❌ Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Cleanup function to remove interceptor
    return () => {
      console.log("🧹 Cleaning up auth interceptor");
      axiosInstance.interceptors.request.eject(requestInterceptor);
    };
  }, [isSignedIn, user]);

  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        {/* PUBLIC HOME PAGE */}
        <Route
          path="/"
          element={!isSignedIn ? <HomePage /> : <Navigate to="/dashboard" replace />}
        />

        {/* ✅ INTERVIEW JOIN - MUST BE BEFORE OTHER ROUTES */}
        <Route path="/interview/join/:roomId" element={<InterviewJoin />} />

        {/* PROTECTED ROUTES - Each route explicitly defined */}
        <Route
          path="/dashboard"
          element={isSignedIn ? <DashboardPage /> : <Navigate to="/" replace />}
        />
        
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemsPage /> : <Navigate to="/" replace />}
        />
        
        <Route
          path="/problem/:id"
          element={isSignedIn ? <ProblemPage /> : <Navigate to="/" replace />}
        />
        
        <Route
          path="/session/:id"
          element={isSignedIn ? <SessionPage /> : <Navigate to="/" replace />}
        />
        
        <Route
          path="/mock-interview/:roomId"
          element={isSignedIn ? <MockInterviewSession /> : <Navigate to="/" replace />}
        />
        
        <Route
          path="/book-interview/:interviewerId"
          element={isSignedIn ? <BookInterview /> : <Navigate to="/" replace />}
        />
        
        <Route
          path="/my-interviews"
          element={isSignedIn ? <MyInterviews /> : <Navigate to="/" replace />}
        />
        
        <Route
          path="/availability"
          element={isSignedIn ? <AvailabilitySettings /> : <Navigate to="/" replace />}
        />
        
        <Route
          path="/schedule"
          element={isSignedIn ? <AvailabilitySettings /> : <Navigate to="/" replace />}
        />
        
        <Route
          path="/room/:id"
          element={isSignedIn ? <RoomPage /> : <Navigate to="/" replace />}
        />
        
        <Route
          path="/interviewers"
          element={isSignedIn ? <InterviewersPage /> : <Navigate to="/" replace />}
        />

        {/* CATCH-ALL 404 - MUST BE LAST */}
        <Route
          path="*"
          element={isSignedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />}
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
          success: {
            duration: 8000,
            icon: '🎉',
            style: {
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
            },
          },
          error: {
            duration: 7000,
            icon: '❌',
            style: {
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
            },
          },
          loading: {
            duration: 10000,
            icon: '⏳',
          },
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
