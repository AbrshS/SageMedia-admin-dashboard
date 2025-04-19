import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination
  const from = location.state?.from || '/dashboard';

  const { login, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Redirect if already authenticated
  // Remove this useEffect as it conflicts with AuthGuard
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate('/dashboard');
  //   }
  // }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic input validation
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Rate limiting
    if (loginAttempts >= 5) {
      toast.error('Too many attempts. Please try again later.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email: email.trim(),
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      // Store the token first
      localStorage.setItem('auth_token', data.token);
      login(data.token, data.user);
      toast.success('Welcome back!');
      
      // Simple navigation to dashboard, let AuthGuard handle the rest
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setLoginAttempts(prev => prev + 1);
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/30 p-4">
      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>
              <p className="text-sm text-gray-500">
                Enter your credentials to access your account
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full border-gray-200"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-gray-200"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || loginAttempts >= 5}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <a 
                href="/forgot-password" 
                className="text-sm text-primary hover:text-primary/80 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
