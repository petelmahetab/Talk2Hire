import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, SignIn } from '@clerk/clerk-react';
import axiosInstance from '../lib/axios'; 
import { Loader2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const InterviewJoin = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const [error, setError] = useState(null);

  console.log("🎯 InterviewJoin MOUNTED!");
  console.log("📍 roomId:", roomId);
  console.log("🔐 Auth Status:", { isLoaded, isSignedIn });

  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) return;

    // If not signed in, don't attempt to join yet
    if (!isSignedIn) {
      console.log("⏸️ User not signed in, waiting for authentication...");
      return;
    }

    // Now user is authenticated, proceed with join
    let cancelled = false;

    const join = async () => {
      if (cancelled) return;

      try {
        console.log('🔄 Joining interview room:', roomId);

        const res = await axiosInstance.post(
          `/interview-schedule/room/${roomId}/join`,
          {},
          { withCredentials: true }
        );

        console.log('✅ Join response:', res.data);

        if (res.data.success && !cancelled) {
          const role = res.data.role;
          
          toast.success(
            role === 'interviewer'
              ? '🎯 Welcome, Interviewer! Select a problem to begin.'
              : '👋 Welcome, Candidate! Waiting for interviewer...',
            { duration: 3000 }
          );

          navigate(`/mock-interview/${roomId}?role=${role}`);
        }
      } catch (err) {
        if (cancelled) return;

        console.error('❌ Join error:', err);
        const msg = err.response?.data?.message || 'Invalid or expired link';
        setError(msg);

        if (msg.includes('15 minutes')) {
          toast.error(
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-bold">Room Not Open Yet</span>
              </div>
              <p className="text-sm mt-1">Opens 15 minutes before start time</p>
            </div>,
            { duration: 5000, id: 'room-not-open' }
          );
        } else {
          toast.error(msg, { id: 'join-error', duration: 4000 });
        }

        setTimeout(() => {
          if (!cancelled) navigate('/dashboard');
        }, 3000);
      }
    };

    join();

    return () => {
      cancelled = true;
    };
  }, [roomId, navigate, isLoaded, isSignedIn]);

  // Show loading while Clerk initializes
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  // Show sign-in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        
        <div className="relative z-10 text-center p-8 bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4">Sign In to Join Interview</h2>
          <p className="text-gray-400 mb-6">Please sign in to access the interview room</p>
          <SignIn 
            routing="hash"
            signUpUrl="/sign-up"
            afterSignInUrl={`/interview/join/${roomId}`}
          />
        </div>
      </div>
    );
  }

  // Rest of your existing UI for authenticated users
  return (
    <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" 
        style={{ animationDelay: '700ms' }} />

      <div className="relative z-10 text-center p-12 bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-md">
        {error ? (
          <>
            <div className="mb-8">
              <AlertCircle className="w-20 h-20 mx-auto text-red-500 animate-pulse" />
            </div>
            <h2 className="font-black text-4xl text-red-500 font-mono tracking-wider mb-4">
              ACCESS DENIED
            </h2>
            <p className="text-gray-300 text-lg mb-2">{error}</p>
            <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
          </>
        ) : (
          <>
            <div className="mb-8">
              <Loader2 
                className="w-20 h-20 animate-spin mx-auto text-purple-500" 
                style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))' }} 
              />
            </div>
            
            <h2 className="font-black text-4xl bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent font-mono tracking-wider animate-pulse mb-4">
              JOINING INTERVIEW
            </h2>
            
            <p className="text-gray-400 text-lg tracking-wide mb-8">
              Please wait while we connect you...
            </p>
            
            <div className="flex justify-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" 
                style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" 
                style={{ animationDelay: '300ms' }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewJoin;
