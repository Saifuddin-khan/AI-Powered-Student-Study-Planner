import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/apiConfig';
import axios from 'axios';

const OAuth2Callback = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token        = params.get('token');
    const refreshToken = params.get('refreshToken');
    const error        = params.get('error');

    if (error) {
      navigate('/login?error=account_disabled');
      return;
    }

    if (!token || !refreshToken) {
      navigate('/login?error=oauth_failed');
      return;
    }

    // Fetch user profile using the token
    axios.get(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const user = res.data;
        login(user, token, refreshToken);
        navigate('/dashboard');
      })
      .catch(() => {
        navigate('/login?error=oauth_failed');
      });
  }, [login, navigate]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', flexDirection: 'column', gap: 16
    }}>
      <div style={{ width: 40, height: 40, border: '3px solid #7C6FCD',
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)' }}>Signing you in...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OAuth2Callback;
