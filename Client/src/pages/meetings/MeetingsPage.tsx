import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus, User, Check, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

interface MeetingItem {
  _id: string;
  hostId: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    startupName?: string;
  };
  guestId: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    startupName?: string;
  };
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface ConnectionUser {
  id: string;
  _id: string;
  name: string;
  avatar: string;
  role: string;
  startupName?: string;
}

export const MeetingsPage: React.FC = () => {
  const { user, backendUrl } = useAuth();
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [connections, setConnections] = useState<ConnectionUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calendar view states
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Modals / Scheduling states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    guestId: '',
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    timeSlot: '09:00 AM - 10:00 AM'
  });

  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM'
  ];

  const fetchMeetings = () => {
    if (!backendUrl) return;
    axios.get(`${backendUrl}/api/meeting`)
      .then(res => {
        if (res.data.success) {
          setMeetings(res.data.meetings);
        }
      })
      .catch(err => {
        console.error("Error loading meetings:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchConnections = () => {
    if (!backendUrl || !user) return;
    const targetRole = user.role === 'entrepreneur' ? 'investor' : 'entrepreneur';
    axios.get(`${backendUrl}/api/user?role=${targetRole}`)
      .then(res => {
        if (res.data.success) {
          setConnections(res.data.users);
        }
      })
      .catch(err => {
        console.error("Error loading opposite role users:", err);
      });
  };

  useEffect(() => {
    fetchMeetings();
    fetchConnections();
  }, [backendUrl, user]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Generate calendar days for current month grid view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay(); // 0 is Sunday, etc.

  // Create filler cells for offset
  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => null);
  const calendarCells = [...blanks, ...daysInMonth];

  // Helper: check if a date has any non-rejected meetings
  const getMeetingsForDate = (date: Date): MeetingItem[] => {
    const formatted = format(date, 'yyyy-MM-dd');
    return meetings.filter(m => m.date === formatted && m.status !== 'rejected');
  };

  // Accept/Reject API
  const handleStatusUpdate = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      if (!backendUrl) return;
      const res = await axios.put(`${backendUrl}/api/meeting/${id}/status`, { status });
      if (res.data.success) {
        toast.success(`Invitation ${status === 'accepted' ? 'accepted' : 'declined'}`);
        setMeetings(prev => prev.map(m => m._id === id ? { ...m, status } : m));
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update meeting invitation status");
    }
  };

  // Cancel/Delete API
  const handleCancelMeeting = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this meeting?")) return;
    try {
      if (!backendUrl) return;
      const res = await axios.delete(`${backendUrl}/api/meeting/${id}`);
      if (res.data.success) {
        toast.success("Meeting cancelled successfully");
        setMeetings(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      console.error("Cancel meeting error:", err);
      toast.error("Failed to cancel meeting");
    }
  };

  // Schedule Submit API
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.guestId || !newMeeting.title || !newMeeting.date || !newMeeting.timeSlot) {
      toast.error("Please fill in all required fields");
      return;
    }

    const toastId = toast.loading("Checking conflicts and scheduling...");
    try {
      if (!backendUrl) return;
      const res = await axios.post(`${backendUrl}/api/meeting`, newMeeting);
      if (res.data.success) {
        toast.success("Meeting scheduled successfully!", { id: toastId });
        setShowScheduleModal(false);
        setNewMeeting({
          guestId: '',
          title: '',
          description: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          timeSlot: '09:00 AM - 10:00 AM'
        });
        fetchMeetings();
      }
    } catch (err: any) {
      console.error("Schedule error:", err);
      const msg = err.response?.data?.message || "Failed to schedule meeting.";
      toast.error(msg, { id: toastId });
    }
  };

  // Filter meetings for the selected calendar date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayMeetings = meetings.filter(m => m.date === selectedDateStr);

  // Incoming pending invitations
  const incomingInvitations = meetings.filter(m => m.guestId._id === user?.id && m.status === 'pending');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meeting Calendar</h1>
          <p className="text-gray-600">Schedule calls, demos, or term sheet reviews conflict-free</p>
        </div>
        
        <Button leftIcon={<Plus size={18} />} onClick={() => setShowScheduleModal(true)}>
          Schedule Meeting
        </Button>
      </div>

      {/* Incoming invites banner */}
      {incomingInvitations.length > 0 && (
        <div className="bg-primary-50 border border-primary-100 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-full text-primary-700">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-primary-900">Meeting Invitations Pending</h4>
              <p className="text-xs text-primary-700">You have {incomingInvitations.length} new meeting requests awaiting your review.</p>
            </div>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto justify-end">
            <a href="#incoming-invites-section" className="text-xs font-semibold text-primary-800 bg-white hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded transition-all">
              Review Now
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-1">
              <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                <ChevronLeft size={18} />
              </button>
              <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                <ChevronRight size={18} />
              </button>
            </div>
          </CardHeader>
          <CardBody className="p-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-400 mb-2">
              <div>SUN</div>
              <div>MON</div>
              <div>TUE</div>
              <div>WED</div>
              <div>THU</div>
              <div>FRI</div>
              <div>SAT</div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((day, index) => {
                if (day === null) {
                  return <div key={`blank-${index}`} className="h-16 border border-transparent"></div>;
                }

                const dayMeetings = getMeetingsForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`h-16 border rounded-lg p-1.5 relative flex flex-col justify-between items-start transition-all hover:bg-primary-50 hover:border-primary-200 ${
                      isSelected 
                        ? 'border-primary-600 bg-primary-50 text-primary-900 ring-2 ring-primary-500 ring-opacity-20' 
                        : isToday
                        ? 'border-accent-400 text-accent-700 bg-accent-50 font-bold'
                        : 'border-gray-100 bg-white text-gray-700'
                    }`}
                  >
                    <span className="text-xs font-medium">{format(day, 'd')}</span>
                    {dayMeetings.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-1 w-full overflow-hidden">
                        {dayMeetings.slice(0, 3).map(m => (
                          <div
                            key={m._id}
                            className={`h-1.5 w-1.5 rounded-full ${
                              m.status === 'accepted' ? 'bg-success-600' : 'bg-primary-500'
                            }`}
                          />
                        ))}
                        {dayMeetings.length > 3 && (
                          <span className="text-[9px] leading-none text-gray-400 font-bold">+{dayMeetings.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Date agenda sidecard */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Agenda for {format(selectedDate, 'MMM d, yyyy')}
              </h3>
            </CardHeader>
            <CardBody className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto">
              {selectedDayMeetings.length > 0 ? (
                selectedDayMeetings.map(meeting => {
                  const isHost = meeting.hostId._id === user?.id;
                  const partner = isHost ? meeting.guestId : meeting.hostId;
                  
                  return (
                    <div key={meeting._id} className="py-3 flex flex-col space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{meeting.title}</h4>
                          <div className="flex items-center space-x-1.5 text-xs text-gray-500 mt-1">
                            <Clock size={12} />
                            <span>{meeting.timeSlot}</span>
                            <Badge variant={meeting.status === 'accepted' ? 'success' : 'warning'} size="sm">
                              {meeting.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {meeting.description && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{meeting.description}</p>
                      )}

                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center space-x-2">
                          <Avatar src={partner.avatar} size="xs" />
                          <span className="text-gray-700 font-medium">{partner.name}</span>
                          <span className="text-gray-400">({partner.role})</span>
                        </div>
                        
                        <button
                          onClick={() => handleCancelMeeting(meeting._id)}
                          className="text-error-600 hover:text-error-700 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CalendarIcon size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No meetings scheduled for this date.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Incoming Invitations list section */}
      <Card id="incoming-invites-section">
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Incoming Invitations</h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100">
            {incomingInvitations.length > 0 ? (
              incomingInvitations.map(invite => (
                <div key={invite._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <Avatar src={invite.hostId.avatar} size="sm" className="mt-1" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{invite.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Invited by <span className="font-medium text-gray-700">{invite.hostId.name}</span> ({invite.hostId.startupName || invite.hostId.role})</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        <span className="flex items-center space-x-1"><CalendarIcon size={12} /> <span>{invite.date}</span></span>
                        <span className="flex items-center space-x-1"><Clock size={12} /> <span>{invite.timeSlot}</span></span>
                      </div>
                      {invite.description && (
                        <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-2 max-w-xl">{invite.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<Check size={14} />}
                      onClick={() => handleStatusUpdate(invite._id, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-error-600 border-error-200 hover:bg-error-50"
                      leftIcon={<X size={14} />}
                      onClick={() => handleStatusUpdate(invite._id, 'rejected')}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No pending meeting invitations.
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Schedule a Meeting</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select User <span className="text-error-500">*</span></label>
                <select
                  required
                  value={newMeeting.guestId}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, guestId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">-- Choose Connection --</option>
                  {connections.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.startupName || c.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title <span className="text-error-500">*</span></label>
                <Input
                  required
                  placeholder="e.g. Pitch Deck Review, Seed Deal Intro"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Add meeting agenda or notes..."
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-error-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot <span className="text-error-500">*</span></label>
                  <select
                    required
                    value={newMeeting.timeSlot}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, timeSlot: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {timeSlots.map(ts => (
                      <option key={ts} value={ts}>{ts}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Schedule Meeting
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
