import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdVisibility } from 'react-icons/md';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import './ImpersonationBanner.css';

function ImpersonationBanner() {
  const { user, impersonating, impersonatedBy, returnToAdmin } = useAuth();
  const navigate = useNavigate();

  if (!impersonating) return null;

  const handleReturn = async () => {
    const impersonatedUserId = user?.id;
    await returnToAdmin(impersonatedUserId);
    toast.success('Returned to admin account');
    navigate('/admin/users');
  };

  return (
    <div className="impersonation-banner">
      <MdVisibility size={16} />
      <span>
        Viewing as <strong>{user?.name || user?.email}</strong>
        {impersonatedBy?.name && <> &mdash; logged in as {impersonatedBy.name}</>}
      </span>
      <button className="impersonation-banner__btn" onClick={handleReturn}>
        Return to Admin
      </button>
    </div>
  );
}

export default ImpersonationBanner;
