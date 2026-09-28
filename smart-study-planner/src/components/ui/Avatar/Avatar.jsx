import React from 'react';
import { getInitials } from '../../../utils/helpers';
import './Avatar.css';

function Avatar({ name = '', src, size = 'md', className = '' }) {
  return (
    <div className={`avatar avatar--${size} ${className}`}>
      {src
        ? <img src={src} alt={name || 'Avatar'} />
        : <span>{getInitials(name) || '?'}</span>}
    </div>
  );
}

export default Avatar;
