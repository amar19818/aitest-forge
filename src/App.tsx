import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/ui/loading-spinner';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateTest from './pages/teacher/CreateTest';
import StudentDashboard from './pages/student/StudentDashboard';
import JoinTest from './pages/shared/JoinTest';
import TakeTest from './pages/shared/TakeTest';
import TestResults from './pages/shared/TestResults';
import Leaderboard from './pages/shared/Leaderboard';
import Profile from './pages/shared/Profile';
import StudentAnalytics from './pages/teacher/StudentAnalytics';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'teacher' | 'student' }> = ({ 
  children, 
  role 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
};

// Public Route Component (for login/register)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      {/* Protected Routes */}
      <Route 
        path="/teacher/dashboard" 
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/create-test" 
        element={
          <ProtectedRoute role="teacher">
            <CreateTest />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/dashboard" 
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/join-test" 
        element={
          <ProtectedRoute>
            <JoinTest />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/take-test/:testId" 
        element={
          <ProtectedRoute>
            <TakeTest />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/results/:submissionId" 
        element={
          <ProtectedRoute>
            <TestResults />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/leaderboard/:testId?" 
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teacher/analytics/:testId" 
        element={
          <ProtectedRoute role="teacher">
            <StudentAnalytics />
          </ProtectedRoute>
        } 
      />
      
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <div className="dark min-h-screen bg-background text-foreground">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </div>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
