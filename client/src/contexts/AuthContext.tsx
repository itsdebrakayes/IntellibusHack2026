import React, { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = sessionStorage.getItem("mock_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading] = useState(false);

  const signIn = useCallback(async (email: string, _password: string) => {
    // Mock: accept any credentials with basic validation
    if (!email || !_password) return { error: "Email and password are required" };
    if (_password.length < 6) return { error: "Password must be at least 6 characters" };

    const profile: UserProfile = {
      id: crypto.randomUUID(),
      email,
      fullName: email.split("@")[0],
    };
    sessionStorage.setItem("mock_user", JSON.stringify(profile));
    setUser(profile);
    return {};
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (!email || !password || !fullName) return { error: "All fields are required" };
    if (password.length < 6) return { error: "Password must be at least 6 characters" };

    const profile: UserProfile = {
      id: crypto.randomUUID(),
      email,
      fullName,
    };
    sessionStorage.setItem("mock_user", JSON.stringify(profile));
    setUser(profile);
    return {};
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem("mock_user");
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!email) return { error: "Email is required" };
    // Mock: always succeed
    return {};
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
