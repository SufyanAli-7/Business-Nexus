import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Phone, Video, Info, Smile } from 'lucide-react';
import axios from 'axios';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChatUserList } from '../../components/chat/ChatUserList';
import { useAuth } from '../../context/AuthContext';
import { Message, User } from '../../types';
import { MessageCircle } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, backendUrl, socket } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
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

  // Listen for realtime messages
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (msg: Message) => {
        // If message belongs to active conversation thread
        if (
          (msg.senderId === currentUser?.id && msg.receiverId === userId) ||
          (msg.senderId === userId && msg.receiverId === currentUser?.id)
        ) {
          setMessages(prev => {
            // Avoid duplicate appends if already present
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
        
        // Refresh sidebar conversation list
        fetchConversations();
      };

      socket.on("receive_message", handleNewMessage);
      return () => {
        socket.off("receive_message", handleNewMessage);
      };
    }
  }, [socket, userId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="flex h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in">
      {/* Conversations sidebar */}
      <div className="hidden md:block w-1/3 lg:w-1/4 border-r border-gray-200">
        <ChatUserList conversations={conversations} />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        {chatPartner ? (
          <>
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
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
                >
                  <Phone size={18} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2"
                  aria-label="Video call"
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
            <div className="border-t border-gray-200 p-4">
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
    </div>
  );
};