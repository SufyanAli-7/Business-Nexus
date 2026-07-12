import React, { useState, useRef } from 'react';
import { User, Lock, Bell, Globe, Palette, CreditCard, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, backendUrl, dispatch } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'language' | 'appearance' | 'billing'>('profile');
  
  // Profile state variables
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Password state variables
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 800 * 1024) {
        toast.error("File is too large. Max size is 800KB.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!backendUrl) return;
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required");
      return;
    }

    setIsSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('location', location);
      formData.append('bio', bio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await axios.put(`${backendUrl}/api/user/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Profile updated successfully!');
        dispatch({ type: 'SET_LOGIN', payload: res.data.user });
        setAvatarFile(null);
        setAvatarPreview('');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setName(user.name || '');
    setEmail(user.email || '');
    setLocation(user.location || '');
    setBio(user.bio || '');
    setAvatarFile(null);
    setAvatarPreview('');
    toast.success("Changes discarded");
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backendUrl) return;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await axios.put(`${backendUrl}/api/user/change-password`, {
        currentPassword,
        newPassword,
        confirmNewPassword
      }, {
        withCredentials: true
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardBody className="p-2">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'profile'
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User size={18} className="mr-3" />
                Profile
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'security'
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lock size={18} className="mr-3" />
                Security
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'notifications'
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell size={18} className="mr-3" />
                Notifications
              </button>
              
              <button
                onClick={() => setActiveTab('language')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'language'
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Globe size={18} className="mr-3" />
                Language
              </button>
              
              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'appearance'
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Palette size={18} className="mr-3" />
                Appearance
              </button>
              
              <button
                onClick={() => setActiveTab('billing')}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'billing'
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CreditCard size={18} className="mr-3" />
                Billing
              </button>
            </nav>
          </CardBody>
        </Card>
        
        {/* Main settings content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && (
            /* Profile Settings */
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar
                    src={avatarPreview || user.avatarUrl}
                    alt={user.name}
                    size="xl"
                  />
                  
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      JPG, GIF or PNG. Max size of 800KB
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  
                  <Input
                    label="Role"
                    value={user.role}
                    disabled
                  />
                  
                  <Input
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border animate-fade-in"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={handleCancelProfile} disabled={isSavingProfile}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                    {isSavingProfile ? (
                      <span className="flex items-center">
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'security' && (
            /* Security Settings */
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                      <Badge variant="error" className="mt-1">Not Enabled</Badge>
                    </div>
                    <Button variant="outline" disabled>Enable</Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    
                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdatingPassword}>
                        {isUpdatingPassword ? (
                          <span className="flex items-center">
                            <Loader2 size={16} className="animate-spin mr-2" />
                            Updating...
                          </span>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab !== 'profile' && activeTab !== 'security' && (
            /* Fallback settings tabs view */
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900 capitalize">{activeTab} Settings</h2>
              </CardHeader>
              <CardBody className="py-12 text-center text-gray-500">
                <Badge variant="warning" className="mb-2">Coming Soon</Badge>
                <p>The {activeTab} preference modules are currently under system scheduling.</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};