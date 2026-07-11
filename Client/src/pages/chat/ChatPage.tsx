import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Phone, Video, Info, Smile, Mic, MicOff, VideoOff, PhoneOff, MessageCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useAuth } from '../../context/AuthContext';
import { Message, User } from '../../types';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, backendUrl, socket } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  // WebRTC Video Call States
  const [callState, setCallState] = useState<'idle' | 'calling' | 'ringing' | 'connected'>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [incomingOffer, setIncomingOffer] = useState<any>(null);
  const [incomingCallerId, setIncomingCallerId] = useState<string | null>(null);
  const [incomingCallerName, setIncomingCallerName] = useState<string>('Someone');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const fetchConversations = () => {
    if (!backendUrl) return;
    axios.get(`${backendUrl}/api/message/conversations`)
      .then(res => {
        if (res.data.success) {
          setConversations(res.data.conversations);
        }
      })
      .catch(err => console.error("Error fetching conversations:", err));
  };

  useEffect(() => {
    fetchConversations();
  }, [backendUrl]);

  // Load chat partner profile info dynamically from backend
  useEffect(() => {
    if (userId && backendUrl) {
      axios.get(`${backendUrl}/api/user/${userId}`)
        .then(res => {
          if (res.data.success) {
            const u = res.data.user;
            if (u) u.id = u.id || u._id;
            setChatPartner(u);
          }
        })
        .catch(err => {
          console.error("Error fetching chat partner profile:", err);
          setChatPartner(null);
        });
    } else {
      setChatPartner(null);
    }
  }, [userId, backendUrl]);

  // Fetch messages between users
  useEffect(() => {
    if (currentUser && userId && backendUrl) {
      setIsHistoryLoading(true);
      axios.get(`${backendUrl}/api/message/${userId}`)
        .then(res => {
          if (res.data.success) {
            setMessages(res.data.messages);
          }
        })
        .catch(err => {
          console.error("Error fetching chat messages:", err);
        })
        .finally(() => {
          setIsHistoryLoading(false);
        });
    } else {
      setMessages([]);
    }
  }, [currentUser, userId, backendUrl]);

  // Listen for realtime messages and WebRTC signaling events
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (msg: Message) => {
        if (
          (msg.senderId === currentUser?.id && msg.receiverId === userId) ||
          (msg.senderId === userId && msg.receiverId === currentUser?.id)
        ) {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
        fetchConversations();
      };

      // WebRTC incoming call listener
      const handleIncomingCall = async (data: { callerId: string; offer: any }) => {
        // Fetch caller name
        let callerName = "Someone";
        try {
          const res = await axios.get(`${backendUrl}/api/user/${data.callerId}`);
          if (res.data.success) {
            callerName = res.data.user.name;
          }
        } catch (e) {
          console.error("Error getting caller name", e);
        }
        setIncomingCallerName(callerName);
        setIncomingCallerId(data.callerId);
        setIncomingOffer(data.offer);
        setCallState('ringing');
      };

      // WebRTC call accepted listener
      const handleCallAccepted = async (data: { receiverId: string; answer: any }) => {
        const pc = pcRef.current;
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            setCallState('connected');
          } catch (err) {
            console.error("Error setting remote description on accept:", err);
          }
        }
      };

      // WebRTC ICE candidate listener
      const handleIceCandidate = async (data: { senderId: string; candidate: any }) => {
        const pc = pcRef.current;
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (err) {
            console.error("Error adding ICE candidate:", err);
          }
        }
      };

      // WebRTC call ended listener
      const handleCallEnded = () => {
        toast("Call ended by remote user");
        cleanUpCall();
      };

      socket.on("receive_message", handleNewMessage);
      socket.on("incoming_call", handleIncomingCall);
      socket.on("call_accepted", handleCallAccepted);
      socket.on("ice_candidate", handleIceCandidate);
      socket.on("call_ended", handleCallEnded);

      return () => {
        socket.off("receive_message", handleNewMessage);
        socket.off("incoming_call", handleIncomingCall);
        socket.off("call_accepted", handleCallAccepted);
        socket.off("ice_candidate", handleIceCandidate);
        socket.off("call_ended", handleCallEnded);
      };
    }
  }, [socket, userId, currentUser, backendUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up WebRTC peer connection and streams
  const cleanUpCall = () => {
    setCallState('idle');
    
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setPeerConnection(null);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIncomingOffer(null);
    setIncomingCallerId(null);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  // Assign stream objects to HTML5 video elements when DOM changes render them
  useEffect(() => {
    if (callState === 'connected') {
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    }
  }, [callState, localStream, remoteStream]);

  // 1. Start Call (caller flow)
  const startCall = async () => {
    if (!socket || !userId || !currentUser) {
      toast.error("Socket not connected or partner not selected");
      return;
    }

    setCallState('calling');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;
      setPeerConnection(pc);

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice_candidate", {
            senderId: currentUser.id,
            receiverId: userId,
            candidate: event.candidate
          });
        }
      };

      // Handle remote track stream
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      // Create WebRTC SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call_user", {
        callerId: currentUser.id,
        receiverId: userId,
        offer
      });
    } catch (err) {
      console.error("Error accessing user media for call:", err);
      toast.error("Failed to access camera and microphone");
      cleanUpCall();
    }
  };

  // 2. Answer Call (receiver flow)
  const answerCall = async () => {
    if (!socket || !incomingOffer || !incomingCallerId || !currentUser) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;
      setPeerConnection(pc);

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice_candidate", {
            senderId: currentUser.id,
            receiverId: incomingCallerId,
            candidate: event.candidate
          });
        }
      };

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      // Set remote SDP offer
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

      // Create SDP answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer_call", {
        callerId: incomingCallerId,
        receiverId: currentUser.id,
        answer
      });

      setCallState('connected');
    } catch (err) {
      console.error("Error answering WebRTC call:", err);
      toast.error("Failed to connect call");
      declineCall();
    }
  };

  // 3. Decline call
  const declineCall = () => {
    if (socket && incomingCallerId) {
      socket.emit("end_call", {
        senderId: currentUser?.id,
        receiverId: incomingCallerId
      });
    }
    cleanUpCall();
  };

  // 4. End Call
  const endCall = () => {
    if (socket && (userId || incomingCallerId)) {
      socket.emit("end_call", {
        senderId: currentUser?.id,
        receiverId: userId || incomingCallerId
      });
    }
    cleanUpCall();
  };

  // Mute Audio toggle
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  };

  // Toggle Video camera on/off
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(prev => !prev);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || !userId) return;
    
    const messageContent = newMessage;
    setNewMessage('');
    
    try {
      if (socket && socket.connected) {
        socket.emit("send_message", {
          senderId: currentUser.id,
          receiverId: userId,
          content: messageContent
        });
      } else {
        console.warn("Socket not connected or disconnected, falling back to HTTP POST");
        const res = await axios.post(`${backendUrl}/api/message`, {
          receiverId: userId,
          content: messageContent
        });
        if (res.data.success) {
          setMessages(prev => [...prev, res.data.message]);
          fetchConversations();
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in relative">
      {/* Conversations sidebar */}
      <div className="hidden md:block w-1/3 lg:w-1/4 border-r border-gray-200">
        <ChatUserList conversations={conversations} />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        {chatPartner ? (
          <>
            <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-white z-10">
              <div className="flex items-center">
                <Avatar
                  src={chatPartner.avatarUrl}
                  alt={chatPartner.name}
                  size="md"
                  status={chatPartner.isOnline ? 'online' : 'offline'}
                  className="mr-3"
                />
                
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{chatPartner.name}</h2>
                  <p className="text-sm text-gray-500">
                    {chatPartner.isOnline ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2"
                  aria-label="Voice call"
                  onClick={startCall}
                >
                  <Phone size={18} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 text-primary-600 hover:text-primary-800"
                  aria-label="Video call"
                  onClick={startCall}
                >
                  <Video size={18} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2"
                  aria-label="Info"
                >
                  <Info size={18} />
                </Button>
              </div>
            </div>
            
            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {isHistoryLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map(message => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isCurrentUser={message.senderId === currentUser.id}
                      senderUser={message.senderId === currentUser.id ? currentUser : chatPartner}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">No messages yet</h3>
                  <p className="text-gray-500 mt-1">Send a message to start the conversation</p>
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2"
                  aria-label="Add emoji"
                >
                  <Smile size={20} />
                </Button>
                
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  fullWidth
                  className="flex-1"
                />
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim()}
                  className="rounded-full p-2 w-10 h-10 flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <MessageCircle size={48} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-700">Select a conversation</h2>
            <p className="text-gray-500 mt-2 text-center">
              Choose a contact from the list to start chatting
            </p>
          </div>
        )}
      </div>

      {/* WebRTC Video Call Overlay */}
      {callState !== 'idle' && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col items-center justify-center p-6 text-white">
          {callState === 'ringing' ? (
            /* Incoming Ringing view */
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="animate-pulse bg-primary-600 p-6 rounded-full relative">
                <Video size={48} className="text-white" />
                <span className="absolute inset-0 rounded-full border-4 border-primary-500 animate-ping"></span>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold">{incomingCallerName}</h3>
                <p className="text-gray-400 text-sm mt-1">Incoming Video Call...</p>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="primary"
                  className="bg-success-600 hover:bg-success-700 px-6 py-2"
                  onClick={answerCall}
                >
                  Answer
                </Button>
                <Button
                  variant="outline"
                  className="border-error-500 text-error-400 hover:bg-error-950 px-6 py-2"
                  onClick={declineCall}
                >
                  Decline
                </Button>
              </div>
            </div>
          ) : callState === 'calling' ? (
            /* Calling Dialing view */
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="animate-bounce bg-primary-700 p-6 rounded-full">
                <Video size={48} className="text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold">{chatPartner?.name}</h3>
                <p className="text-gray-400 text-sm mt-1">Dialing...</p>
              </div>

              <Button
                variant="outline"
                className="border-error-500 text-error-400 hover:bg-error-950 px-6 py-2"
                onClick={endCall}
                leftIcon={<PhoneOff size={16} />}
              >
                Cancel Call
              </Button>
            </div>
          ) : (
            /* Call Connected - WebRTC Video Grid */
            <div className="w-full h-full flex flex-col justify-between">
              {/* Call partner identity */}
              <div className="flex justify-between items-center p-2 bg-black bg-opacity-40 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Avatar src={chatPartner?.avatarUrl} size="sm" />
                  <div>
                    <h4 className="text-sm font-medium">{chatPartner?.name}</h4>
                    <p className="text-[10px] text-gray-300">WebRTC Call Connected</p>
                  </div>
                </div>
              </div>

              {/* Videos Container */}
              <div className="flex-1 my-4 relative rounded-xl overflow-hidden bg-black flex items-center justify-center">
                {/* Remote Partner Full Screen Video */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Local Camera Picture-in-Picture */}
                <div className="absolute top-4 right-4 w-32 md:w-48 aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg bg-gray-800">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {isVideoOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-xs text-gray-400">
                      Camera Off
                    </div>
                  )}
                </div>
              </div>

              {/* Call Controls bar */}
              <div className="flex justify-center items-center space-x-4 p-4 bg-black bg-opacity-40 rounded-xl">
                <Button
                  variant="ghost"
                  className={`rounded-full p-3 ${isMuted ? 'bg-error-600 hover:bg-error-700' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </Button>

                <Button
                  variant="ghost"
                  className={`rounded-full p-3 ${isVideoOff ? 'bg-error-600 hover:bg-error-700' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
                  onClick={toggleVideo}
                  aria-label={isVideoOff ? 'Turn video on' : 'Turn video off'}
                >
                  {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </Button>

                <Button
                  variant="ghost"
                  className="rounded-full p-3 bg-error-600 hover:bg-error-700 text-white"
                  onClick={endCall}
                  aria-label="Hang up"
                >
                  <PhoneOff size={20} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};