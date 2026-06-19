import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import useAuth from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/helpers';
import './Login.css';

/* ── STUDEAID logo image ─ */
const StudeaidLogo = ({ size = 40 }) => (
  <img
    src="/studeaid-logo-removebg-preview.png"
    alt="STUDEAID"
    style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
  />
);

/* ================================================================
   PASSWORD STRENGTH
   ================================================================ */
function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['', '#DC2626', '#D97706', '#16A34A', '#0891B2'];

function PasswordStrength({ password }) {
  if (!password) return null;
  const s = getStrength(password);
  return (
    <div className="ln-pw-strength">
      <div className="ln-pw-bars">
        {[1,2,3,4].map(i => (
          <div key={i} className={`ln-pw-bar${i <= s ? ` ln-pw-bar-${s}` : ''}`} />
        ))}
      </div>
      <span className="ln-pw-label" style={{ color: STRENGTH_COLOR[s] }}>
        {STRENGTH_LABEL[s]} password
      </span>
    </div>
  );
}

/* ── Eye toggle ─ */
function EyeBtn({ visible, onToggle }) {
  return (
    <button type="button" className="ln-eye" onClick={onToggle} tabIndex={-1}>
      {visible ? <FiEyeOff size={17} /> : <FiEye size={17} />}
    </button>
  );
}

/* ── Google SVG ─ */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ── Facebook SVG ─ */
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
);

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const from      = location.state?.from?.pathname || '/dashboard';

  const [tab, setTab] = useState(
    location.state?.tab === 'register' ? 'register' : 'signin'
  );

  /* Sign-in state */
  const [signIn, setSignIn]         = useState({ email: '', password: '' });
  const [siErrors, setSiErrors]     = useState({});
  const [siLoading, setSiLoading]   = useState(false);
  const [siShowPw, setSiShowPw]     = useState(false);

  /* Register state */
  const [reg, setReg]                 = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [regErrors, setRegErrors]     = useState({});
  const [regLoading, setRegLoading]   = useState(false);
  const [regShowPw, setRegShowPw]     = useState(false);
  const [regShowCPw, setRegShowCPw]   = useState(false);

  /* Shared error banner */
  const [bannerErr, setBannerErr] = useState('');

  useEffect(() => {
    if (location.state?.tab) setTab(location.state.tab);
  }, [location.state]);

  const switchTab = (t) => { setTab(t); setBannerErr(''); setSiErrors({}); setRegErrors({}); };

  /* ── Sign In ─ */
  const changeSi = (e) => {
    const { name, value } = e.target;
    setSignIn(p => ({ ...p, [name]: value }));
    if (siErrors[name]) setSiErrors(p => ({ ...p, [name]: '' }));
    setBannerErr('');
  };
  const validateSi = () => {
    const e = {};
    if (!signIn.email)    e.email    = 'Email is required';
    if (!signIn.password) e.password = 'Password is required';
    return e;
  };
  const handleSignIn = async (ev) => {
    ev.preventDefault();
    const e = validateSi();
    if (Object.keys(e).length) { setSiErrors(e); return; }
    setSiLoading(true); setBannerErr('');
    try {
      const res  = await authService.login({ email: signIn.email, password: signIn.password });
      const data = res.data.data;
      const userData = { id: data.userId, name: data.name, email: data.email, role: data.role };
      login(userData, data.accessToken, data.refreshToken);
      toast.success('Welcome back! 👋');
      navigate(userData.role === 'ADMIN' ? '/admin/dashboard' : from, { replace: true });
    } catch (err) {
      setBannerErr(getErrorMessage(err));
    } finally {
      setSiLoading(false);
    }
  };

  /* ── Register ─ */
  const changeReg = (e) => {
    const { name, value } = e.target;
    setReg(p => ({ ...p, [name]: value }));
    if (regErrors[name]) setRegErrors(p => ({ ...p, [name]: '' }));
    setBannerErr('');
  };
  const validateReg = () => {
    const e = {};
    if (!reg.name.trim())        e.name            = 'Full name is required';
    if (!reg.email)              e.email           = 'Email is required';
    if (reg.password.length < 6) e.password        = 'Minimum 6 characters';
    if (reg.password !== reg.confirmPassword)
                                 e.confirmPassword = 'Passwords do not match';
    return e;
  };
  const handleRegister = async (ev) => {
    ev.preventDefault();
    const e = validateReg();
    if (Object.keys(e).length) { setRegErrors(e); return; }
    setRegLoading(true); setBannerErr('');
    try {
      const res  = await authService.register({ name: reg.name, email: reg.email, password: reg.password });
      const data = res.data.data;
      const userData = { id: data.userId, name: data.name, email: data.email, role: data.role };
      login(userData, data.accessToken, data.refreshToken);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setBannerErr(getErrorMessage(err));
    } finally {
      setRegLoading(false);
    }
  };

  /* ── Social placeholders ─ */
  const handleGoogle   = () => toast.info('Google OAuth integration ready. In production this connects to Spring Security OAuth2.');
  const handleFacebook = () => toast.info('Facebook OAuth integration ready. In production this connects to Spring Security OAuth2.');

  /* ── Render ─ */
  return (
    <div className="ln-page">

      {/* ══════════════════════════════════════
          LEFT PANEL — Blue
      ══════════════════════════════════════ */}
      <div className="ln-left">
        {/* Logo */}
        <div className="ln-left-logo">
          <StudeaidLogo size={42} />
          <span className="ln-left-logo-name">STUDEAID</span>
        </div>

        {/* Headline */}
        <div className="ln-left-content">
          <h2 className="ln-left-h2">
            Study smarter,<br />
            <span className="ln-left-h2-dim">not harder.</span>
          </h2>
          <p className="ln-left-sub">
            The all-in-one AI-powered study platform that keeps you organized, focused, and always one step ahead.
          </p>

          {/* Stats bar */}
          <div className="ln-left-stats">
            <div className="ln-left-stat">
              <span className="ln-left-stat-num">2,400+</span>
              <span className="ln-left-stat-lbl">Students</span>
            </div>
            <div className="ln-left-stat-div" />
            <div className="ln-left-stat">
              <span className="ln-left-stat-num">10+</span>
              <span className="ln-left-stat-lbl">Modules</span>
            </div>
            <div className="ln-left-stat-div" />
            <div className="ln-left-stat">
              <span className="ln-left-stat-num">24/7</span>
              <span className="ln-left-stat-lbl">AI Support</span>
            </div>
          </div>

          {/* Feature list */}
          <div className="ln-left-features">
            {[
              'Smart subject & task management',
              'AI assistant powered by Google Gemini',
              'Pomodoro timer with focus analytics',
              'Goal tracking & progress reports',
              'Personalized study schedules',
            ].map(text => (
              <div key={text} className="ln-feat-row">
                <div className="ln-feat-check">✓</div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — White
      ══════════════════════════════════════ */}
      <div className="ln-right">
        <div className="ln-form-card">

          {/* Header */}
          <div className="ln-form-hd">
            <h2 className="ln-form-title">Welcome back</h2>
            <p className="ln-form-subtitle">Sign in to your account to continue</p>
          </div>

          {/* Tabs */}
          <div className="ln-tabs">
            <button
              className={`ln-tab${tab === 'signin'   ? ' ln-tab-active' : ''}`}
              onClick={() => switchTab('signin')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`ln-tab${tab === 'register' ? ' ln-tab-active' : ''}`}
              onClick={() => switchTab('register')}
              type="button"
            >
              Create Account
            </button>
          </div>

          {/* Error banner */}
          {bannerErr && (
            <div className="ln-banner-err" role="alert">
              <FiAlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {bannerErr}
            </div>
          )}

          {/* Social buttons */}
          <div className="ln-socials">
            <button className="ln-social-btn" onClick={handleGoogle} type="button">
              <GoogleIcon />
              Continue with Google
            </button>
            <button className="ln-social-btn" onClick={handleFacebook} type="button" style={{ marginTop: 10 }}>
              <FacebookIcon />
              Continue with Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="ln-divider"><span>or continue with email</span></div>

          {/* ── SIGN IN FORM ─────────────────────────── */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} noValidate>

              <div className="ln-field">
                <label className="ln-label">Email address</label>
                <div className="ln-input-wrap">
                  <span className="ln-input-icon"><FiMail size={16} /></span>
                  <input
                    type="email"
                    name="email"
                    className={`ln-input${siErrors.email ? ' ln-input-error' : ''}`}
                    placeholder="you@example.com"
                    value={signIn.email}
                    onChange={changeSi}
                    autoComplete="email"
                  />
                </div>
                {siErrors.email && <span className="ln-field-err">{siErrors.email}</span>}
              </div>

              <div className="ln-field">
                <div className="ln-label-row">
                  <label className="ln-label">Password</label>
                  <button type="button" className="ln-forgot"
                    onClick={() => navigate('/forgot-password')}>
                    Forgot password?
                  </button>
                </div>
                <div className="ln-input-wrap">
                  <span className="ln-input-icon"><FiLock size={16} /></span>
                  <input
                    type={siShowPw ? 'text' : 'password'}
                    name="password"
                    className={`ln-input ln-input-pr${siErrors.password ? ' ln-input-error' : ''}`}
                    placeholder="Enter your password"
                    value={signIn.password}
                    onChange={changeSi}
                    autoComplete="current-password"
                  />
                  <EyeBtn visible={siShowPw} onToggle={() => setSiShowPw(v => !v)} />
                </div>
                {siErrors.password && <span className="ln-field-err">{siErrors.password}</span>}
              </div>

              <div className="ln-remember-row">
                <label className="ln-remember">
                  <input type="checkbox" />
                  Remember me
                </label>
              </div>

              <button type="submit" className="ln-submit" disabled={siLoading}>
                {siLoading ? <span className="ln-spinner" /> : 'Sign In'}
              </button>

              <div className="ln-switch">
                Don't have an account?{' '}
                <button type="button" onClick={() => switchTab('register')}>Create one free</button>
              </div>
            </form>
          )}

          {/* ── REGISTER FORM ─────────────────────────── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} noValidate>

              <div className="ln-field">
                <label className="ln-label">Full Name</label>
                <div className="ln-input-wrap">
                  <span className="ln-input-icon"><FiUser size={16} /></span>
                  <input
                    type="text"
                    name="name"
                    className={`ln-input${regErrors.name ? ' ln-input-error' : ''}`}
                    placeholder="Alex Johnson"
                    value={reg.name}
                    onChange={changeReg}
                    autoComplete="name"
                  />
                </div>
                {regErrors.name && <span className="ln-field-err">{regErrors.name}</span>}
              </div>

              <div className="ln-field">
                <label className="ln-label">Email address</label>
                <div className="ln-input-wrap">
                  <span className="ln-input-icon"><FiMail size={16} /></span>
                  <input
                    type="email"
                    name="email"
                    className={`ln-input${regErrors.email ? ' ln-input-error' : ''}`}
                    placeholder="you@example.com"
                    value={reg.email}
                    onChange={changeReg}
                    autoComplete="email"
                  />
                </div>
                {regErrors.email && <span className="ln-field-err">{regErrors.email}</span>}
              </div>

              <div className="ln-field">
                <label className="ln-label">Password</label>
                <div className="ln-input-wrap">
                  <span className="ln-input-icon"><FiLock size={16} /></span>
                  <input
                    type={regShowPw ? 'text' : 'password'}
                    name="password"
                    className={`ln-input ln-input-pr${regErrors.password ? ' ln-input-error' : ''}`}
                    placeholder="Create a strong password"
                    value={reg.password}
                    onChange={changeReg}
                    autoComplete="new-password"
                  />
                  <EyeBtn visible={regShowPw} onToggle={() => setRegShowPw(v => !v)} />
                </div>
                {regErrors.password && <span className="ln-field-err">{regErrors.password}</span>}
                <PasswordStrength password={reg.password} />
              </div>

              <div className="ln-field">
                <label className="ln-label">Confirm Password</label>
                <div className="ln-input-wrap">
                  <span className="ln-input-icon"><FiLock size={16} /></span>
                  <input
                    type={regShowCPw ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`ln-input ln-input-pr${regErrors.confirmPassword ? ' ln-input-error' : ''}`}
                    placeholder="Repeat your password"
                    value={reg.confirmPassword}
                    onChange={changeReg}
                    autoComplete="new-password"
                  />
                  <EyeBtn visible={regShowCPw} onToggle={() => setRegShowCPw(v => !v)} />
                </div>
                {regErrors.confirmPassword && <span className="ln-field-err">{regErrors.confirmPassword}</span>}
              </div>

              <button type="submit" className="ln-submit" disabled={regLoading}>
                {regLoading ? <span className="ln-spinner" /> : 'Create Account'}
              </button>

              <p className="ln-terms">
                By signing up you agree to our{' '}
                <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
              </p>

              <div className="ln-switch">
                Already have an account?{' '}
                <button type="button" onClick={() => switchTab('signin')}>Sign in</button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
