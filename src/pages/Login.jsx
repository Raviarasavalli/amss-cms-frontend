import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Building2, Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: 'admin@amss.com',
      password: 'Admin@123',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Welcome back to AMSS CMS! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden select-none transition-colors"
      style={{ background: 'var(--bg)' }}
    >
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
        />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Main Card */}
        <div
          className="rounded-3xl p-8 border shadow-2xl space-y-6"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-modal)'
          }}
        >
          {/* Logo Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 mb-2">
              <Building2 size={30} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-1)' }}>
              Welcome Back
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
              Sign in to your AMSS CMS Account
            </p>
          </div>

          {/* Demo Credentials Alert Box (High contrast, clearly visible) */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Demo Administrator Access
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs pt-1">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Email: </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">admin@amss.com</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Password: </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">Admin@123</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-1)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                  })}
                  type="email"
                  placeholder="admin@amss.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none"
                  style={{
                    background: 'var(--bg)',
                    borderColor: errors.email ? '#ef4444' : 'var(--border)',
                    color: 'var(--text-1)',
                  }}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 font-medium mt-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-1)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border text-sm font-medium transition-all outline-none"
                  style={{
                    background: 'var(--bg)',
                    borderColor: errors.password ? '#ef4444' : 'var(--border)',
                    color: 'var(--text-1)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 font-medium mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all duration-200
                bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing In…
                </>
              ) : (
                <>
                  Sign In to CMS <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>
              AMSS Content Management System © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
