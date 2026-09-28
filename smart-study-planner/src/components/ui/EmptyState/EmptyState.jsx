import React from 'react';
import './EmptyState.css';

function EmptyState({ icon, title, message, action }) {
  return (
    <div className="empty-state">
      {icon  && <div className="empty-state__icon">{icon}</div>}
      {title && <h3 className="empty-state__title">{title}</h3>}
      {message && <p className="empty-state__message">{message}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
