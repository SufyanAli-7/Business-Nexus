import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, UserPlus, DollarSign } from 'lucide-react';
import axios from 'axios';
import { Card, CardBody } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItem {
  id: string;
  type: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  unread: boolean;
}

export const NotificationsPage: React.FC = () => {
  const { backendUrl } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = () => {
    if (!backendUrl) return;
    axios.get(`${backendUrl}/api/notification`)
      .then(res => {
        if (res.data.success) {
          setNotifications(res.data.notifications);
        }
      })
      .catch(err => {
        console.error("Error loading notifications:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, [backendUrl]);

  const handleMarkAllRead = async () => {
    try {
      if (!backendUrl) return;
      const res = await axios.put(`${backendUrl}/api/notification/mark-all-read`);
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      if (!backendUrl) return;
      const res = await axios.put(`${backendUrl}/api/notification/${id}/read`);
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
      }
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={16} className="text-primary-600" />;
      case 'connection':
        return <UserPlus size={16} className="text-secondary-600" />;
      case 'investment':
        return <DollarSign size={16} className="text-accent-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };
  
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
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your network activity</p>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={notifications.every(n => !n.unread)}>
          Mark all as read
        </Button>
      </div>
      
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <Card
              key={notification.id}
              className={`transition-colors duration-200 cursor-pointer ${
                notification.unread ? 'bg-primary-50 hover:bg-primary-100/50' : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                if (notification.unread) {
                  handleMarkOneRead(notification.id);
                }
              }}
            >
              <CardBody className="flex items-start p-4">
                <Avatar
                  src={notification.user.avatar}
                  alt={notification.user.name}
                  size="md"
                  className="flex-shrink-0 mr-4"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {notification.user.name}
                    </span>
                    {notification.unread && (
                      <Badge variant="primary" size="sm" rounded>New</Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mt-1">
                    {notification.content}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    {getNotificationIcon(notification.type)}
                    <span>
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Bell size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500 mt-1">You are all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};