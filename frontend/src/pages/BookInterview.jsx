import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import schedulingApi from '../api/schedulingApi';
import CalendarView from '../components/scheduling/CalendarView';
import TimeSlotPicker from '../components/scheduling/TimeSlotPicker';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  ArrowLeft, Calendar, Clock, User, Mail, Phone, MessageSquare,
  Sparkles, CheckCircle2, Loader2, Briefcase 
} from 'lucide-react';

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
  const [interviewerSchedules, setInterviewerSchedules] = useState([]);

  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    candidatePhone: '+91 ',
    notes: ''
  });

  // Format phone number as user types
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Ensure it always starts with +91
    if (!value.startsWith('+91')) {
      value = '+91 ' + value.replace(/^\+91\s*/, '');
    }
    
    // Remove non-numeric characters after +91
    const numbers = value.slice(4).replace(/\D/g, '');
    
    // Limit to 10 digits
    if (numbers.length <= 10) {
      setFormData({ ...formData, candidatePhone: '+91 ' + numbers });
    }
  };

  useEffect(() => {
    if (interviewerId && selectedDate) fetchAvailableSlots();
  }, [interviewerId, selectedDate]);

  useEffect(() => {
    const fetchInterviewerSchedules = async () => {
      try {
        const response = await schedulingApi.getInterviewers();
        if (response.success) {
          const interviewer = response.interviewers.find(
            (i) => i.interviewerId === interviewerId
          );
          if (interviewer) {
            setInterviewerSchedules(interviewer.schedules || []);
          }
        }
      } catch (error) {
        console.error('Error fetching interviewer schedules:', error);
      }
    };

    if (interviewerId) {
      fetchInterviewerSchedules();
    }
  }, [interviewerId]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await schedulingApi.getAvailableSlots(
        interviewerId,
        dateString,
        null,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );

      if (response.success) setAvailableSlots(response.slots);
      else setAvailableSlots([]);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load slots');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) return toast.error('Please select a time slot');
    if (!formData.candidateName || !formData.candidateEmail)
      return toast.error('Name & Email are required');

    // Validate phone number (should be +91 followed by 10 digits)
    const phoneDigits = formData.candidatePhone.replace(/\D/g, '').slice(2); // Remove +91
    if (formData.candidatePhone.trim() !== '+91' && phoneDigits.length > 0 && phoneDigits.length !== 10) {
      return toast.error('Phone number must be 10 digits');
    }

    setLoading(true);
    try {
      const bookingData = {
        interviewerId,
        interviewerName: 'Mahetab Patel',
        interviewerEmail: 'patelmahetab9020@gmail.com',
        candidateName: formData.candidateName,
        candidateEmail: formData.candidateEmail,
        candidatePhone: formData.candidatePhone.trim() === '+91' ? '' : formData.candidatePhone,
        scheduledTime: selectedSlot.start,
        duration: selectedSlot.duration,
        interviewType,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: formData.notes
      };

      const res = await schedulingApi.bookInterview(bookingData);
      if (res.success) {
        toast.success('🎉 Interview booked! Check your email.');
        navigate('/my-interviews');
      } else toast.error(res.message || 'Booking failed');
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Back Button */}
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-10 px-4">
        <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">
          Schedule Interview
        </h1>
        <p className="text-xl text-base-content/70">Pick the perfect time with Mahetab Patel</p>
      </div>

      {/* Step Indicator */}
      <div className="max-w-4xl mx-auto px-4 mb-10">
        <div className="flex items-center justify-center gap-8">
          {['Select Date', 'Choose Time', 'Confirm Details'].map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold transition-all ${step > i
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-xl'
                    : step === i + 1
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-xl ring-4 ring-primary/30'
                      : 'bg-base-300 text-base-content/50'
                    }`}
                >
                  {step > i ? <CheckCircle2 className="w-8 h-8" /> : i + 1}
                </div>
                <span className={`text-lg font-bold ${step >= i + 1 ? 'text-primary' : 'text-base-content/50'}`}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className={`w-24 h-1 ${step > i + 1 ? 'bg-primary' : 'bg-base-300'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12">
        {/* Step 1 - Calendar */}
        {step === 1 && (
          <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 p-8">
            <h2 className="text-3xl font-black text-center mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Pick a Date
            </h2>
            <CalendarView
              events={[]}
              selectedDate={selectedDate}
              availableSlots={availableSlots}
              interviewerSchedules={interviewerSchedules}
              onSelectSlot={(slot) => {
                setSelectedDate(slot.start);
                setStep(2);
              }}
            />
          </div>
        )}

        {/* Step 2 - Time Slots */}
        {step === 2 && (
          <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Choose Time
                </h2>
                <p className="text-xl text-base-content/70 mt-2">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-primary hover:text-secondary font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> Change Date
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableSlots.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Clock className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                    <p className="text-xl text-base-content/60">No slots available for this date</p>
                  </div>
                ) : (
                  availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedSlot?.start === slot.start
                          ? 'bg-gradient-to-br from-primary via-secondary to-accent border-transparent shadow-2xl color-black shadow-primary-20/10 scale-105'
                          : 'bg-gradient-to-brrom-primary via-secondary to-accent hover:border-primary-500/50 hover:shadow-lg hover:shadow-white-500/20'
                      }`}
                    >
                      <p className={`text-xl font-black ${
                        selectedSlot?.start === slot.start ? 'text-black' : 'text-white'
                      }`}>
                        {format(new Date(slot.start), 'h:mm a')}
                      </p>
                      <p className={`text-sm mt-1 ${
                        selectedSlot?.start === slot.start ? 'text-white' : 'text-gray-400'
                      }`}>
                        {slot.duration} min
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}

            {selectedSlot && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setStep(3)}
                  className="px-12 py-5 bg-gradient-to-r from-primary via-secondary to-accent text-black text-xl font-bold rounded-2xl hover:shadow-2xl hover:bg-primary/20 transition-all flex items-center gap-3 mx-auto"
                >
                  Continue <Sparkles className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3 - Confirm Details */}
        {step === 3 && (
          <div className="bg-base-100 rounded-3xl shadow-2xl border border-base-300 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Confirm Booking
              </h2>
              <button
                onClick={() => setStep(2)}
                className="text-primary hover:text-secondary font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> Change Time
              </button>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 mb-10 border border-primary/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary" /> Interview Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <div className="flex items-center gap-4">
                  <Clock className="w-7 h-7 text-primary" />
                  <div>
                    <p className="text-base-content/70">Time</p>
                    <p className="font-black text-2xl" style={{ color: '#000000' }}>{format(new Date(selectedSlot.start), 'h:mm a')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Calendar className="w-7 h-7 text-primary" />
                  <div>
                    <p className="text-base-content/70">Date</p>
                    <p className="font-bold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-3 text-lg font-bold mb-3">
                    <User className="w-6 h-6 text-primary" /> Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.candidateName}
                    onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                    className="input input-bordered input-primary w-full text-lg"
                    placeholder="Enter candidate name"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 text-lg font-bold mb-3">
                    <Mail className="w-6 h-6 text-primary" /> Email *
                  </label>
                  <input
                    type="email"
                    value={formData.candidateEmail}
                    onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                    className="input input-bordered input-primary w-full text-lg"
                    placeholder="Enter candidate email"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 text-lg font-bold mb-3">
                  <Phone className="w-6 h-6 text-primary" /> Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.candidatePhone}
                  onChange={handlePhoneChange}
                  className="input input-bordered input-primary w-full text-lg"
                  placeholder="+91 9876543210"
                  maxLength={14}
                />
                <p className="text-sm text-base-content/60 mt-2">
                  Format: +91 followed by 10 digits
                </p>
              </div>

              <div>
                <label className="flex items-center gap-3 text-lg font-bold mb-3">
                  <Briefcase className="w-6 h-6 text-primary" /> Interview Type
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="select select-primary w-full text-lg"
                >
                  <option value="technical">💻 Technical Interview</option>
                  <option value="coding">🔧 Coding Round</option>
                  <option value="system-design">📐 System Design</option>
                  <option value="behavioral">🗣️ Behavioral</option>
                  <option value="general">📋 General</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 text-lg font-bold mb-3">
                  <MessageSquare className="w-6 h-6 text-primary" /> Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="textarea textarea-primary w-full text-lg"
                  placeholder="Any specific topics you'd like to discuss or prepare for?"
                />
              </div>
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={handleBooking}
                disabled={loading}
                className="btn btn-primary btn-wide text-xl font-bold flex items-center gap-3 mx-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" /> Booking...
                  </>
                ) : (
                  <>
                    Confirm & Book <Sparkles className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookInterview;