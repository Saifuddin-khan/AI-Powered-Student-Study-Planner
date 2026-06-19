import React from 'react';
import './ProgressBar.css';

function ProgressBar({ value = 0, max = 100, label, color, size = 'sm' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="progress-bar">
      {(label !== undefined) && (
        <div className="progress-bar__header">
          {label && <span className="progress-bar__label">{label}</span>}
          <span className="progress-bar__value">{Math.round(percent)}%</span>
        </div>
      )}
      <div className={`progress-bar__track${size === 'lg' ? ' progress-bar__track--lg' : ''}`}>
        <div
          className="progress-bar__fill"
          style={{ width: `${percent}%`, background: color || undefined }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
