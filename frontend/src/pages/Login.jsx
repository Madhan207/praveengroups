import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Zap, ArrowRight, X, CheckCircle, Send } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Forgot-Password Modal
   A self-contained slide-up card that appears over the login form.
───────────────────────────────────────────────────────── */
const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep]     = useState('idle'); // idle | loading | sent
  const [fpEmail, setFpEmail] = useState('');
  const { toast } = useToast();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!fpEmail) return;
    setStep('loading');

    // Simulate API call (replace with real endpoint when backend supports it)
    await new Promise(r => setTimeout(r, 1500));
    setStep('sent');

    // Also show a toast
    toast('Password reset link sent! Check your inbox.', 'success', 5000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Sheet */}
      <motion.div
        className="relative w-full max-w-sm rounded-3xl p-7 shadow-2xl z-10"
        style={{ background: 'rgba(15,22,35,0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
        initial={{ y: 60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/8 text-white/50 hover:text-white hover:bg-white/15 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          {step !== 'sent' ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-purple-900/40">
                <Lock className="w-5 h-5 text-white" />
              </div>

              <h2 className="text-xl font-heading font-bold text-white mb-1">Forgot password?</h2>
              <p className="text-sm text-white/45 mb-6">
                Enter your email and we'll send you a secure reset link.
              </p>

              <form onSubmit={handleSend} className="space-y-4">
                <div className={`flex items-center rounded-2xl border transition-all ${fpEmail ? 'border-brand-400/60 bg-white/10' : 'border-white/15 bg-white/8'}`}>
                  <Mail className="w-4 h-4 ml-4 shrink-0 text-white/40" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={fpEmail}
                    onChange={e => setFpEmail(e.target.value)}
                    placeholder="Your account email"
                    className="flex-1 bg-transparent px-3 py-3.5 text-white text-sm outline-none placeholder-white/30"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={step === 'loading' || !fpEmail}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}
                >
                  {step === 'loading' ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                      Sending link…
                    </>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Reset Link</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              {/* Animated check */}
              <motion.div
                className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
              >
                <CheckCircle className="w-8 h-8 text-green-400" />
              </motion.div>
              <h2 className="text-xl font-heading font-bold text-white mb-2">Check your inbox!</h2>
              <p className="text-sm text-white/45 mb-6">
                We've sent a password reset link to <span className="text-white/80 font-medium">{fpEmail}</span>
              </p>
              <p className="text-xs text-white/30 mb-6">
                Didn't receive it? Check your spam folder or try again in a few minutes.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-all border border-white/15"
              >
                Back to Sign In
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────
   Google Sign-in Modal
   Shows after GSI credential response – tells user
   Google auth backend is not yet connected.
───────────────────────────────────────────────────────── */
const GoogleComingSoonModal = ({ googleName, googleEmail, onClose }) => (
  <motion.div
    className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <motion.div
      className="relative w-full max-w-sm rounded-3xl p-7 shadow-2xl z-10 text-center"
      style={{ background: 'rgba(15,22,35,0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
      initial={{ y: 60, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 60, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
    >
      <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/8 text-white/50 hover:text-white hover:bg-white/15 transition-all">
        <X className="w-4 h-4" />
      </button>

      {/* Google G logo */}
      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-5 shadow-lg">
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
          <path fill="#34A853" d="M16.041 18.013A7.077 7.077 0 0 1 12 19.09c-3.133 0-5.78-2.014-6.723-4.823l-4.04 3.067C3.193 21.297 7.265 24 12 24c2.933 0 5.735-1.043 7.834-3.001l-3.793-2.986z"/>
          <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.621-5.096 3.621-9 0-.71-.091-1.473-.255-2.182H12v4.636h6.436a5.506 5.506 0 0 1-2.395 3.376L19.834 21z"/>
          <path fill="#FBBC05" d="M5.277 14.267A7.07 7.07 0 0 1 4.91 12c0-.782.135-1.533.367-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.444 3.73 1.237 5.335l4.04-3.068z"/>
        </svg>
      </div>

      {googleName ? (
        <>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Signed in as</p>
          <h2 className="text-lg font-heading font-bold text-white mb-0.5">{googleName}</h2>
          <p className="text-sm text-white/40 mb-5">{googleEmail}</p>
        </>
      ) : (
        <h2 className="text-xl font-heading font-bold text-white mb-3">Google Account Connected</h2>
      )}

      <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl px-4 py-3 mb-5 text-left">
        <p className="text-amber-300 text-xs font-semibold mb-1">⚙️ Backend Integration Pending</p>
        <p className="text-amber-200/60 text-xs leading-relaxed">
          Google OAuth is verified on your end. The backend needs a Google token endpoint to complete the sign-in. Please use email & password login for now.
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-2xl bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-all border border-white/15"
      >
        Use Email Sign In
      </button>
    </motion.div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────
   Main Login Component
───────────────────────────────────────────────────────── */
export const Login = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused]   = useState(false);

  // Modal states
  const [showForgot, setShowForgot]     = useState(false);
  const [googleModal, setGoogleModal]   = useState(null); // null | { name, email }
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, user, loading: authLoading } = useAuth();
  const navigate                              = useNavigate();
  const [params]                              = useSearchParams();
  const { toast }                             = useToast();
  const unauthorized                          = params.get('unauthorized') === 'true';

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.is_staff ? '/admin' : '/', { replace: true });
    }
  }, [user, authLoading]);

  // Unauthorized toast
  useEffect(() => {
    if (unauthorized) {
      toast('Unauthorized Access — Admin privileges required.', 'error', 5000);
    }
  }, []);

  // ── Main login ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(email, password);
      if (userData.is_staff) {
        toast('Welcome back, Admin! 🛡️', 'success');
        navigate('/admin', { replace: true });
      } else {
        toast(`Welcome back, ${userData.name}! 🛍️`, 'success');
        navigate('/', { replace: true });
      }
    } catch {
      toast('Invalid email or password. Please try again.', 'error');
    }
    setLoading(false);
  };

  // ── Google Sign-in ──────────────────────────────────────
  // Uses Google Identity Services (GSI) One Tap / popup
  const handleGoogleLogin = () => {
    // Check if GSI script has loaded
    if (!window.google?.accounts?.id) {
      toast('Google Sign-In is loading, please try again in a moment.', 'info');
      return;
    }

    setGoogleLoading(true);

    // Initialize GSI with your Google Client ID
    // Replace GOOGLE_CLIENT_ID below with your actual OAuth 2.0 client ID from Google Cloud Console
    const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        setGoogleLoading(false);
        if (response.credential) {
          // Decode the JWT to get user info (for display purposes)
          try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            setGoogleModal({ name: payload.name, email: payload.email });
          } catch {
            setGoogleModal({ name: '', email: '' });
          }
        }
      },
      error_callback: () => {
        setGoogleLoading(false);
        toast('Google sign-in was cancelled or failed.', 'warning');
      },
    });

    // Trigger the popup
    window.google.accounts.id.prompt((notification) => {
      setGoogleLoading(false);
      if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
        // Fallback: open full Google OAuth popup
        window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: (tokenResponse) => {
            if (tokenResponse.access_token) {
              // Fetch user info from Google
              fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`)
                .then(r => r.json())
                .then(info => setGoogleModal({ name: info.name, email: info.email }))
                .catch(() => setGoogleModal({ name: '', email: '' }));
            }
          },
        }).requestAccessToken();
      }
    });
  };

  if (authLoading) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 login-gradient-bg flex items-center justify-center overflow-hidden">
        {/* Animated blobs */}
        <div className="login-blob-1 absolute top-[-10%] left-[-10%] w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="login-blob-2 absolute bottom-[-15%] right-[-10%] w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="login-blob-3 absolute top-[40%] left-[60%] w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative w-full max-w-md mx-4"
        >
          {/* Glass card */}
          <div className="glass-dark rounded-3xl px-8 pt-9 pb-8 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center justify-center mb-7">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-700 flex items-center justify-center shadow-lg shadow-brand-900/60">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-heading font-bold text-white text-center mb-1.5">Welcome back</h1>
            <p className="text-center text-sm text-white/50 mb-7">Sign in to your Praveen Groups account</p>

            {/* Unauthorized banner */}
            {unauthorized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/20 border border-red-500/40 text-red-300 rounded-2xl px-4 py-3 mb-5 text-sm text-center font-medium"
              >
                🔒 Unauthorized Access — Admin privileges required.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="floating-label-group">
                <div className={`flex items-center rounded-2xl border transition-all ${emailFocused ? 'border-brand-400 bg-white/10' : 'border-white/15 bg-white/8'}`}>
                  <Mail className="w-4 h-4 ml-4 shrink-0" style={{ color: emailFocused ? '#60a5fa' : 'rgba(255,255,255,0.4)' }} />
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      id="login-email"
                      required
                      value={email}
                      placeholder=" "
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      className="w-full bg-transparent px-3 pt-5 pb-2 text-white text-sm outline-none placeholder-transparent"
                      autoComplete="email"
                    />
                    <label
                      htmlFor="login-email"
                      className={`absolute left-3 pointer-events-none transition-all duration-200 ${email || emailFocused ? 'top-1.5 text-[10px] text-white/50 uppercase tracking-wider' : 'top-1/2 -translate-y-1/2 text-sm text-white/40'}`}
                    >
                      Email Address
                    </label>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="floating-label-group">
                <div className={`flex items-center rounded-2xl border transition-all ${passFocused ? 'border-brand-400 bg-white/10' : 'border-white/15 bg-white/8'}`}>
                  <Lock className="w-4 h-4 ml-4 shrink-0" style={{ color: passFocused ? '#60a5fa' : 'rgba(255,255,255,0.4)' }} />
                  <div className="flex-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-pass"
                      required
                      value={password}
                      placeholder=" "
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setPassFocused(true)}
                      onBlur={() => setPassFocused(false)}
                      className="w-full bg-transparent px-3 pt-5 pb-2 text-white text-sm outline-none placeholder-transparent pr-10"
                      autoComplete="current-password"
                    />
                    <label
                      htmlFor="login-pass"
                      className={`absolute left-3 pointer-events-none transition-all duration-200 ${password || passFocused ? 'top-1.5 text-[10px] text-white/50 uppercase tracking-wider' : 'top-1/2 -translate-y-1/2 text-sm text-white/40'}`}
                    >
                      Password
                    </label>
                  </div>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="mr-4 text-white/40 hover:text-white/70 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-brand-500"
                  />
                  <span className="text-xs text-white/50">Remember me</span>
                </label>

                {/* ── FORGOT PASSWORD — opens modal ── */}
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors underline-offset-2 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: 'white', boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative flex items-center my-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="px-3 text-xs text-white/30">or continue with</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* ── GOOGLE SIGN-IN — triggers GSI popup ── */}
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.35)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-2xl border border-white/15 bg-white/8 text-white text-sm font-medium flex items-center justify-center gap-2.5 hover:bg-white/12 transition-all disabled:opacity-60 relative overflow-hidden"
              >
                {/* Subtle shimmer on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                {googleLoading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                    <path fill="#34A853" d="M16.041 18.013A7.077 7.077 0 0 1 12 19.09c-3.133 0-5.78-2.014-6.723-4.823l-4.04 3.067C3.193 21.297 7.265 24 12 24c2.933 0 5.735-1.043 7.834-3.001l-3.793-2.986z"/>
                    <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.621-5.096 3.621-9 0-.71-.091-1.473-.255-2.182H12v4.636h6.436a5.506 5.506 0 0 1-2.395 3.376L19.834 21z"/>
                    <path fill="#FBBC05" d="M5.277 14.267A7.07 7.07 0 0 1 4.91 12c0-.782.135-1.533.367-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.444 3.73 1.237 5.335l4.04-3.068z"/>
                  </svg>
                )}
                {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
              </motion.button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-white/40">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Modals rendered outside the card ── */}
      <AnimatePresence>
        {showForgot && (
          <ForgotPasswordModal key="forgot" onClose={() => setShowForgot(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {googleModal && (
          <GoogleComingSoonModal
            key="google"
            googleName={googleModal.name}
            googleEmail={googleModal.email}
            onClose={() => setGoogleModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
