import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, userProfile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Elegant loading state that matches the WYGO aesthetic
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-primary animate-spin" />
        <div className="mt-8 text-[10px] font-bold tracking-widest text-white/40">
          INITIALIZING_SYNC
        </div>
      </div>
    );
  }

  const isLoginPage = location.pathname === '/login';
  const isOnboardingPage = location.pathname === '/onboarding';

  // If user is not authenticated and trying to access a protected route
  if (!user && requireAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but hasn't completed onboarding, force onboarding
  if (user && userProfile && !userProfile.onboardingCompleted && !isOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is fully set up and trying to access login or onboarding
  if (user && userProfile?.onboardingCompleted && (isLoginPage || isOnboardingPage)) {
    return <Navigate to="/" replace />;
  }

  // Allow through
  return <>{children}</>;
};

export default ProtectedRoute;
