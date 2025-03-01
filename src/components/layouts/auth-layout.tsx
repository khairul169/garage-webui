import { useAuth } from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const AuthLayout = () => {
  const auth = useAuth();

  if (auth.isLoading) {
    return null;
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-svh flex items-center justify-center">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
