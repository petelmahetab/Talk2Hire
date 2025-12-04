// src/pages/InterviewJoin.jsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const InterviewJoin = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  useNavigate();

  useEffect(() => {
    let cancelled = false;

    const join = async () => {
      if (cancelled) return;

      try {
        const res = await axios.post(`/api/interview-schedule/room/${roomId}/join`, {}, {
          withCredentials: true,
        });

        if (res.data.success && !cancelled) {
          const role = res.data.role;
          toast.success(
            role === 'interviewer'
              ? 'Welcome, Interviewer! Select a problem to begin.'
              : 'Welcome, Candidate! Waiting for interviewer...',
            { duration: 4000 }
          );
          navigate(`/session/${roomId}?type=scheduled&role=${role}`);
        }
      } catch (err) {
        if (cancelled) return;

        const msg = err.response?.data?.message || 'Invalid or expired link';

        if (msg.includes('15 minutes')) {
          toast.error(
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-bold">Room Not Open Yet</span>
              </div>
              <p className="text-sm mt-1">Opens 15 minutes before start time</p>
            </div>,
            { duration: 4000, id: 'room-not-open' }
          );
        } else {
          toast.error(msg, { id: 'join-error' });
        }
        navigate('/');
      }
    };

    join();

    return () => {
      cancelled = true;
    };
  }, [roomId, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />

      <div className="relative z-10 text-center p-12 bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
        {/* Spinning Loader with glow */}
        <div className="mb-8">
          <Loader2 className="w-20 h-20 animate-spin mx-auto text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent drop-shadow-2xl" />
        </div>

        {/* Gradient animated loading text */}
        <h2 className="font-black text-4xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider animate-pulse">
          JOINING INTERVIEW ROOM
        </h2>

        <p className="text-gray-400 mt-4 text-lg tracking-wide">
          Please wait while we connect you...
        </p>

        {/* Subtle pulsing dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default InterviewJoin;