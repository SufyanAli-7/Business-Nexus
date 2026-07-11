import React, { createContext, useState, useContext, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { User, UserRole, AuthContextType } from '../types';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState = { isAuth: false, user: null as User | null };

type AuthState = typeof initialState;
type AuthAction = 
  | { type: 'SET_LOGIN'; payload: User }
  | { type: 'SET_LOGOUT' };

const reducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_LOGIN':
            return { ...state, isAuth: true, user: action.payload };
        case 'SET_LOGOUT':
            return initialState;
        default:
            return state;
    }
};

// Auth Provider Component
export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const navigate = useNavigate();
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    useEffect(() => {
        if (state.isAuth && state.user && state.user.id) {
            const socketUrl = backendUrl;
            const newSocket = io(socketUrl, {
                withCredentials: true
            });

            newSocket.emit("register", state.user.id);
            setSocket(newSocket);

            console.log("Client connected to Socket.IO and registered room:", state.user.id);

            return () => {
                newSocket.disconnect();
                console.log("Client disconnected from Socket.IO");
            };
        } else {
            setSocket(null);
        }
    }, [state.isAuth, state.user, backendUrl]);

    const readProfile = () => {
        axios.defaults.withCredentials = true;
        axios.get(`${backendUrl}/api/user/profile`)
            .then((res) => {
                const { success, user } = res.data;
                if (success && user) {
                    const formattedUser = { ...user, id: user.id || user._id };
                    dispatch({ type: 'SET_LOGIN', payload: formattedUser });
                }
            })
            .catch((err) => {
                const { status } = err.response || {};
                if (status !== 401 && status !== 404) {
                    console.error("Error fetching profile:", err);
                }
            })
            .finally(() => {
                setIsAppLoading(false);
            });
    };

    useEffect(() => {
        readProfile();
    }, []);

    const handleLogout = () => {
        axios.defaults.withCredentials = true;
        axios.post(`${backendUrl}/api/auth/logout`)
            .then((res) => {
                const { success, message } = res.data;
                if (success) {
                    dispatch({ type: 'SET_LOGOUT' });
                    navigate('/login');
                    
                    // Fallback to window.toastify if available, otherwise use react-hot-toast
                    if (typeof window !== 'undefined' && (window as any).toastify) {
                        (window as any).toastify(message, "success");
                    } else {
                        toast.success(message || "Logged out successfully");
                    }
                }
            })
            .catch((err) => {
                const errMsg = err.response?.data?.message || "Failed to logout";
                console.error(errMsg);
                toast.error(errMsg);
            });
    };

    const login = async (email: string, password: string, role: UserRole): Promise<void> => {
        setIsAppLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${backendUrl}/api/auth/login`, { email, password, role });
            const { success, message } = res.data;
            if (success) {
                // Fetch user data right away
                const profileRes = await axios.get(`${backendUrl}/api/user/profile`);
                if (profileRes.data.success && profileRes.data.user) {
                    const profileUser = profileRes.data.user;
                    const formattedUser = { ...profileUser, id: profileUser.id || profileUser._id };
                    dispatch({ type: 'SET_LOGIN', payload: formattedUser });
                }
                toast.success(message || "Successfully logged in!");
                navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
            }
        } catch (err: any) {
            const errMsg = err.response?.data?.message || "Failed to login";
            toast.error(errMsg);
            throw new Error(errMsg);
        } finally {
            setIsAppLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
        setIsAppLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password, role });
            const { success, message } = res.data;
            if (success) {
                toast.success(message || "Account created successfully!");
                // Auto login after registration
                await login(email, password, role);
            }
        } catch (err: any) {
            const errMsg = err.response?.data?.message || "Failed to register";
            toast.error(errMsg);
            throw new Error(errMsg);
        } finally {
            setIsAppLoading(false);
        }
    };

    const forgotPassword = async (email: string): Promise<void> => {
        setIsAppLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${backendUrl}/api/auth/forgot-password`, { email });
            const { success, message } = res.data;
            if (success) {
                toast.success(message || "Reset link sent to your email!");
            }
        } catch (err: any) {
            const errMsg = err.response?.data?.message || "Failed to request reset";
            toast.error(errMsg);
            throw new Error(errMsg);
        } finally {
            setIsAppLoading(false);
        }
    };

    const resetPassword = async (token: string, newPassword: string): Promise<void> => {
        setIsAppLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${backendUrl}/api/auth/reset-password/${token}`, { password: newPassword });
            const { success, message } = res.data;
            if (success) {
                toast.success(message || "Password reset successfully!");
                navigate('/login');
            }
        } catch (err: any) {
            const errMsg = err.response?.data?.message || "Failed to reset password";
            toast.error(errMsg);
            throw new Error(errMsg);
        } finally {
            setIsAppLoading(false);
        }
    };

    const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
        // Mock method for compatibility
        toast.success("Profile updated!");
    };

    return (
        <AuthContext.Provider value={{
            user: state.user,
            isAuth: state.isAuth,
            isAppLoading,
            handleLogout,
            dispatch,
            backendUrl,
            readProfile,
            login,
            register,
            forgotPassword,
            resetPassword,
            updateProfile,
            socket,
            isAuthenticated: state.isAuth, // compatibility alias
            isLoading: isAppLoading,       // compatibility alias
            logout: handleLogout          // compatibility alias
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};

// Keep old named export for backward compatibility
export { AuthContextProvider as AuthProvider };

export default AuthContextProvider;