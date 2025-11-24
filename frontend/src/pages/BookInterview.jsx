import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import schedulingApi from '../api/schedulingApi';
import CalendarView from '../components/scheduling/CalendarView';
import TimeSlotPicker from '../components/scheduling/TimeSlotPicker';
import { format, addDays, startOfDay } from 'date-fns';

const BookInterview = () => {
  const { interviewerId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [interviewType, setInterviewType] = useState('technical');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    candidateName: user?.fullName || '',
    candidateEmail: user?.primaryEmailAddress?.emailAddress || '',
    candidatePhone: '',
    notes: ''
  });

  useEffect(() => {
    if (interviewerId && selectedDate) {
      fetchAvailableSlots();
    }
  }, [interviewerId, selectedDate]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {

      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`; // e.g. "2025-11-29"

      console.log('Fetching slots for date:', dateString); // Debug

      const response = await schedulingApi.getAvailableSlots(
        interviewerId,
        dateString,
        null,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );

      if (response.success) {
        setAvailableSlots(response.slots);
        console.log('Slots loaded:', response.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      alert('Failed to load available slots. Please try again.');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    if (!formData.candidateName || !formData.candidateEmail) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        interviewerId,
        interviewerName: 'Interviewer Name',
        interviewerEmail: 'interviewer@example.com',
        candidateName: formData.candidateName,
        candidateEmail: formData.candidateEmail,
        candidatePhone: formData.candidatePhone,
        scheduledTime: selectedSlot.start,
        duration: selectedSlot.duration,
        interviewType,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: formData.notes
      };

      const response = await schedulingApi.bookInterview(bookingData);

      if (response.success) {
        alert('🎉 Interview booked successfully! Check your email for details.');
        navigate('/my-interviews');
      } else {
        alert(response.message || 'Failed to book interview');
      }
    } catch (error) {
      console.error('Error booking interview:', error);
      alert(error.message || 'Failed to book interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📅 Schedule Your Interview
          </h1>
          <p className="text-lg text-gray-600">
            Select a convenient time slot for your interview
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { num: 1, label: 'Select Date' },
              { num: 2, label: 'Choose Time' },
              { num: 3, label: 'Confirm Details' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${step >= s.num
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {s.num}
                </div>
                <span className={`text-sm ${step >= s.num ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {s.label}
                </span>
                {idx < 2 && (
                  <div
                    className={`h-1 w-16 ${step > s.num ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Select a Date
            </h2>
            <CalendarView
              events={[]}
              onSelectSlot={(slotInfo) => {
                setSelectedDate(slotInfo.start);
                setStep(2);
              }}
            />
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Select Time
                </h2>
                <p className="text-gray-600 mt-1">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Change Date
              </button>
            </div>

            <TimeSlotPicker
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              loading={loading}
            />

            {selectedSlot && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setStep(3)}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Continue to Details →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Confirm Your Details
              </h2>
              <button
                onClick={() => setStep(2)}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Change Time
              </button>
            </div>

            <div className="bg-indigo-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Interview Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">📅 Date:</span>
                  <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">⏰ Time:</span>
                  <span className="font-medium">{format(new Date(selectedSlot.start), 'h:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">⏱️ Duration:</span>
                  <span className="font-medium">{selectedSlot.duration} minutes</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.candidateName}
                  onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.candidateEmail}
                  onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.candidatePhone}
                  onChange={(e) => setFormData({ ...formData, candidatePhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Type
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="technical">💻 Technical Interview</option>
                  <option value="coding">🔧 Coding Round</option>
                  <option value="system-design">📐 System Design</option>
                  <option value="behavioral">🗣️ Behavioral Interview</option>
                  <option value="general">📋 General Interview</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="4"
                  placeholder="Any specific topics you'd like to focus on?"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleBooking}
                disabled={loading}
                className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Booking...' : '✅ Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookInterview;