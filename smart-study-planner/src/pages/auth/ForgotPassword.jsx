import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdArrowBack, MdLockReset } from 'react-icons/md';
import { toast } from 'react-toastify';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';
import { getErrorMessage } from '../../utils/helpers';
import api from '../../services/api';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-center-page">
      <div className="auth-center-card">
        <div className="auth-center-card__icon">
          <MdLockReset size={26} />
        </div>

        {sent ? (
          <div className="auth-center-card__success">
            <div className="auth-center-card__success-icon">📬</div>
            <h2 className="auth-center-card__title">Check your inbox</h2>
            <p className="auth-center-card__subtitle">
              We sent a password reset OTP to <strong>{email}</strong>. Enter the code on the next screen.
            </p>
            <Button fullWidth onClick={() => navigate('/reset-password')}>
              Enter OTP
            </Button>
            <button className="auth-center-card__back" onClick={() => navigate('/login')}>
              <MdArrowBack size={14} /> Back to Login
            </button>
          </div>
        ) : (
          <>
            <h2 className="auth-center-card__title">Forgot password?</h2>
            <p className="auth-center-card__subtitle">
              Enter your email and we'll send you an OTP to reset your password.
            </p>
            <form className="auth-center-card__form" onSubmit={handleSubmit}>
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                error={error}
                icon={<MdEmail size={16} />}
                required
              />
              <Button type="submit" loading={loading} fullWidth>
                Send Reset OTP
              </Button>
              <button
                type="button"
                className="auth-center-card__back"
                onClick={() => navigate('/login')}
              >
                <MdArrowBack size={14} /> Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
