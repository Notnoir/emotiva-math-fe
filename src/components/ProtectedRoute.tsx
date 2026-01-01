import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "teacher" | "student";
}

export default function ProtectedRoute({
  children,
  requireRole,
}: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role - redirect to appropriate page
  if (requireRole && currentUser.role !== requireRole) {
    if (currentUser.role === "teacher") {
      return <Navigate to="/teacher" replace />;
    } else {
      return <Navigate to="/student-dashboard" replace />;
    }
  }

  // Authenticated and correct role - render children
  return <>{children}</>;
}
