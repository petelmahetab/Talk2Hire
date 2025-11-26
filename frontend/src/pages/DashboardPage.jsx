// frontend/src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";

import { Calendar, Users, Settings, Sparkles, ArrowRight, Zap } from 'lucide-react';

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" });

  const createSessionMutation = useCreateSession();
  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useMyRecentSessions();

  const handleCreateRoom = () => {
    if (!roomConfig.problem || !roomConfig.difficulty) return;

    createSessionMutation.mutate(
      {
        problem: roomConfig.problem,
        difficulty: roomConfig.difficulty.toLowerCase(),
      },
      {
        onSuccess: (data) => {
          setShowCreateModal(false);
          navigate(`/session/${data.session._id}`);
        },
      }
    );
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];

  const isUserInSession = (session) => {
    if (!user?.id) return false;
    return session.host?.clerkId === user.id || session.participant?.clerkId === user.id;
  };

  return (
    <>
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <WelcomeSection onCreateSession={() => setShowCreateModal(true)} />

        {/* HERO SECTION — ONLY NAVBAR + 3 BUTTONS + 1 LINE */}
        <div className="max-w-7xl mx-auto px-6 pb-32">
          {/* 3 Beautiful Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            {/* Set My Availability */}
            <button
              onClick={() => navigate('/availability')}
              className="group relative overflow-hidden bg-base-100/50 backdrop-blur-xl rounded-3xl border border-base-300 p-12 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="p-8 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl shadow-2xl">
                  <Settings className="w-20 h-20 text-white" />
                </div>
                <h3 className="text-5xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Set My Availability
                </h3>
                <p className="text-xl text-base-content/70 text-center max-w-xs">
                  Let candidates book mock interviews with you
                </p>
                <ArrowRight className="w-12 h-12 text-primary group-hover:translate-x-4 transition-transform" />
              </div>
            </button>

            {/* My Interviews */}
            <button
              onClick={() => navigate('/my-interviews')}
              className="group relative overflow-hidden bg-base-100/50 backdrop-blur-xl rounded-3xl border border-base-300 p-12 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="p-8 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl shadow-2xl">
                  <Calendar className="w-20 h-20 text-white" />
                </div>
                <h3 className="text-5xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  My Interviews
                </h3>
                <p className="text-xl text-base-content/70 text-center max-w-xs">
                  View upcoming & past mock interviews
                </p>
                <ArrowRight className="w-12 h-12 text-primary group-hover:translate-x-4 transition-transform" />
              </div>
            </button>

            {/* Browse Interviewers */}
            <button
              onClick={() => navigate('/interviewers')}
              className="group relative overflow-hidden bg-base-100/50 backdrop-blur-xl rounded-3xl border border-base-300 p-12 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="p-8 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl shadow-2xl">
                  <Users className="w-20 h-20 text-white" />
                </div>
                <h3 className="text-5xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Browse Interviewers
                </h3>
                <p className="text-xl text-base-content/70 text-center max-w-xs">
                  Book 1-on-1 mock interviews now
                </p>
                <Sparkles className="w-12 h-12 text-primary group-hover:rotate-12 group-hover:scale-125 transition-all" />
              </div>
            </button>
          </div>

          {/* ONE PERFECT LINE — PRODUCTION READY */}
          <div className="text-center mt-20">
            <p className="text-3xl font-bold text-base-content/80 flex items-center justify-center gap-4">
              <Zap className="w-10 h-10 text-primary animate-pulse" />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Level up your interview skills with real developers
              </span>
              <Zap className="w-10 h-10 text-primary animate-pulse" />
            </p>
          </div>
        </div>

        {/* SECOND VIEWPORT — SESSIONS SECTION */}
        <div className="bg-base-100/50 backdrop-blur-sm border-t border-base-300">
          <div className="max-w-7xl mx-auto px-6 py-20">
            {/* Heading + 2 Lines */}
            <div className="text-center mb-16">
              <h2 className="text-6xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
                 Coding Sessions
              </h2>
              <p className="text-2xl text-base-content/70 mb-4">
                Practice with friends or jump into live mock interviews
              </p>
              <p className="text-xl text-base-content/60">
                Real-time collaboration • Video call • Code execution
              </p>
            </div>

            {/* Your existing sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StatsCards
                activeSessionsCount={activeSessions.length}
                recentSessionsCount={recentSessions.length}
              />
              <ActiveSessions
                sessions={activeSessions}
                isLoading={loadingActiveSessions}
                isUserInSession={isUserInSession}
              />
            </div>
            <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />
          </div>
        </div>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
      />
    </>
  );
}

export default DashboardPage;