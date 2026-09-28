import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdShield, MdLock } from 'react-icons/md';
import { toast } from 'react-toastify';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';
import { getErrorMessage } from '../../utils/helpers';
import api from '../../services/api';
import './ForgotPassword.css';
import './ResetPassword.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.otp.trim())            errs.otp = 'OTP is required';
    if (form.newPassword.length < 6) errs.newPassword = 'Min 6 characters';
    if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        otp:         form.otp,
        newPassword: form.newPassword,
      });
      setDone(true);
      toast.success('Password reset successfully!');
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
          <MdShield size={26} />
        </div>

        {done ? (
          <div className="auth-center-card__success">
            <div className="auth-center-card__success-icon">✅</div>
            <h2 className="auth-center-card__title">Password Reset!</h2>
            <p className="auth-center-card__subtitle">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <Button fullWidth onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        ) : (
          <>
            <h2 className="auth-center-card__title">Reset password</h2>
            <p className="auth-center-card__subtitle">
              Enter the OTP sent to your email and your new password.
            </p>
            <form className="auth-center-card__form" onSubmit={handleSubmit}>
              <Input
                label="OTP Code"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={form.otp}
                onChange={change}
                error={errors.otp}
                icon={<MdShield size={16} />}
                required
              />
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="Min. 6 characters"
                value={form.newPassword}
                onChange={change}
                error={errors.newPassword}
                icon={<MdLock size={16} />}
                required
              />
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                placeholder="Repeat new password"
                value={form.confirmPassword}
                onChange={change}
                error={errors.confirmPassword}
                icon={<MdLock size={16} />}
                required
              />
              <Button type="submit" loading={loading} fullWidth>
                Reset Password
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
