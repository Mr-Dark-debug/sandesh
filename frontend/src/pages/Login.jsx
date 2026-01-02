import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, checkHealth } from '../api';
import { Input } from '../components/ui';
import { Mail, Lock, AlertCircle, Eye, EyeOff, BookOpen, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [namespace, setNamespace] = useState('local');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/app');
    }

    // Get namespace from health endpoint
    checkHealth()
      .then(({ data }) => {
        if (data.namespace) {
          setNamespace(data.namespace);
        }
      })
      .catch(() => { });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await login(username, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/app');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else if (!err.response) {
        setError('Unable to connect to server');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F6F8FC] items-center justify-center p-12">
        <div className="max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A3A380] to-[#8B8B68] flex items-center justify-center shadow-lg">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#3D3D3D]">सनdesh</h1>
              <p className="text-sm text-[#8B8B8B]">Local Email System</p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-[#3D3D3D] leading-tight mb-4">
                Simple, secure email for your local network.
              </h2>
              <p className="text-[#6B6B6B] leading-relaxed">
                Sandesh is a privacy-first email system that works entirely on your local network.
                No internet required, no data leaves your premises.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="p-4 rounded-xl bg-white shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#D7CE93]/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-[#A3A380]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#3D3D3D]">100% Private</p>
                <p className="text-xs text-[#8B8B8B] mt-1">Data never leaves your network</p>
              </div>

              <div className="p-4 rounded-xl bg-white shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#D7CE93]/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-[#A3A380]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[#3D3D3D]">Zero Setup</p>
                <p className="text-xs text-[#8B8B8B] mt-1">Works out of the box</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A3A380] to-[#8B8B68] flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#3D3D3D]">सनdesh</h1>
              <p className="text-xs text-[#8B8B8B]">Local Email</p>
            </div>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#3D3D3D] mb-2">
              Sign in
            </h2>
            <p className="text-[#6B6B6B]">
              Enter your credentials to access your mailbox
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="mb-6 flex items-center gap-3 p-4 bg-[#C4756E]/10 border border-[#C4756E]/20 rounded-xl text-[#C4756E]"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="relative">
              <Input
                label="Username"
                id="username"
                type="text"
                required
                autoComplete="username"
                autoFocus
                className="pl-11 pr-4 py-3.5 bg-[#F6F8FC] border-[#E5E8EB] focus:ring-[#A3A380]/10 focus:border-[#A3A380]"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              <div className="absolute left-4 top-[2.4rem] -translate-y-1/2 pointer-events-none">
                <Mail className="w-4 h-4 text-[#8B8B8B]" />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                label="Password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="pl-11 pr-12 py-3.5 bg-[#F6F8FC] border-[#E5E8EB] focus:ring-[#A3A380]/10 focus:border-[#A3A380]"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <div className="absolute left-4 top-[2.4rem] -translate-y-1/2 pointer-events-none">
                <Lock className="w-4 h-4 text-[#8B8B8B]" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute right-4 top-[2.4rem] -translate-y-1/2
                  text-[#8B8B8B] hover:text-[#3D3D3D]
                  p-1 rounded-md
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A3A380]
                  transition-colors
                "
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="
                w-full py-3.5 mt-2
                bg-[#A3A380] hover:bg-[#8B8B68] text-white
                rounded-xl font-semibold text-sm
                transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                shadow-sm hover:shadow-md
              "
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#F0F0F0]">
            <p className="text-center text-xs text-[#8B8B8B] mb-3">
              Connected to <span className="font-medium text-[#A3A380]">@{namespace}</span>
            </p>
            <div className="text-center">
              <Link
                to="/docs"
                className="inline-flex items-center gap-1.5 text-xs text-[#A3A380] hover:text-[#8B8B68]"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Learn more about सनdesh
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
