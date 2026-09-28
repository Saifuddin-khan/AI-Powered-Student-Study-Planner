import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="not-found">
      <div className="not-found__code">404</div>
      <h1 className="not-found__title">Page Not Found</h1>
      <p className="not-found__message">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
    </div>
  );
}
