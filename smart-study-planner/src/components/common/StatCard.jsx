import React from 'react';
import './StatCard.css';

function StatCard({ icon, value, label, accent, change, changeDir }) {
  const iconBg = accent ? `${accent}20` : undefined;

  return (
    <div
      className="stat-card"
      style={{
        '--stat-accent':   accent,
        '--stat-icon-bg':  iconBg,
      }}
    >
      {icon && (
        <div className="stat-card__icon-wrap">{icon}</div>
      )}
      <div className="stat-card__body">
        <div className="stat-card__value">{value ?? '—'}</div>
        <div className="stat-card__label">{label}</div>
        {change !== undefined && (
          <div className={`stat-card__change stat-card__change--${changeDir || 'up'}`}>
            {changeDir === 'down' ? '↓' : '↑'} {change}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
