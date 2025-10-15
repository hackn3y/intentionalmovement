import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  console.log('PrivateRoute check:', { user: !!user, role: user?.role, loading });

  if (loading) {
    console.log('PrivateRoute: Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    console.log('PrivateRoute: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // TEMPORARY: Allow all authenticated users until role column exists in production
  // Logged in but not admin - redirect to unauthorized page
  // if (user.role !== 'admin') {
  //   console.log('PrivateRoute: User not admin, redirecting to unauthorized');
  //   return <Navigate to="/unauthorized" replace />;
  // }

  // Admin user - allow access
  console.log('PrivateRoute: Allowing access (role check temporarily disabled)');
  return children;
}

export default PrivateRoute;
