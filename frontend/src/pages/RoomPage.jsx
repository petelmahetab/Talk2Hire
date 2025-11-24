import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Video, Mic, MicOff, VideoOff, ScreenShare, PhoneOff } from 'lucide-react';

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  useEffect(() => {
    if (!user) {
      alert('Please sign in to join the interview');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mock Interview Room</h1>
          <p className="text-sm opacity-80">Room ID: {roomId}</p>
        </div>
        <button
          onClick={() => navigate('/my-interviews')}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium"
        >
          ← Back to Interviews
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
          {/* Interviewer's Video */}
          <div className="bg-gray-800 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
            <div className="text-white text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
                {user?.firstName?.[0] || 'I'}
              </div>
              <p className="text-xl font-semibold">Interviewer</p>
              <p className="text-sm opacity-70">Waiting to join...</p>
            </div>
          </div>

          {/* Your Video */}
          <div className="bg-gray-800 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
            <div className="text-white text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
                {user?.firstName?.[0] || 'Y'}
              </div>
              <p className="text-xl font-semibold">{user?.fullName || 'You'}</p>
              <p className="text-sm opacity-70">Ready</p>
            </div>
            {!videoOn && (
              <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                <VideoOff className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-6">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`p-4 rounded-full transition-all ${micOn ? 'bg-white text-gray-900' : 'bg-red-600 text-white'}`}
          >
            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`p-4 rounded-full transition-all ${videoOn ? 'bg-white text-gray-900' : 'bg-red-600 text-white'}`}
          >
            {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600">
            <ScreenShare className="w-6 h-6" />
          </button>

          <button
            onClick={() => navigate('/my-interviews')}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-full font-bold text-white flex items-center gap-3"
          >
            <PhoneOff className="w-6 h-6" />
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;