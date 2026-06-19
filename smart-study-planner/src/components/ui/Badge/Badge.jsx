import React from 'react';
import './Badge.css';

function Badge({ children, variant = 'primary', icon, className = '' }) {
  return (
    <span className={`badge badge--${variant} ${className}`}>
      {icon && icon}
      {children}
    </span>
  );
}

export default Badge;
