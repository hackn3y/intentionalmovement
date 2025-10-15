import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Calling login...');
      const result = await login(email, password);
      console.log('Login result:', result);
      if (result && result.success) {
        toast.success('Login successful!');
        console.log('Navigating to /dashboard...');
        navigate('/dashboard');
        console.log('Navigate called');
      } else {
        toast.error((result && result.error) || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-accent-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-accent-500">
            Intentional Movement
          </h1>
          <p className="text-gray-600 mt-2 font-body">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2 font-body"
            >
              Email or Username
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-accent-200 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors font-body"
              placeholder="admin@example.com or username"
              autoCapitalize="none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2 font-body"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-accent-200 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors font-body"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-500 text-white py-3 rounded-lg font-medium font-body hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600 font-body">Use admin credentials to access the dashboard</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
