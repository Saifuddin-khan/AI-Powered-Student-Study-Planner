import React from 'react';
import './Skeleton.css';

function Skeleton({ width, height, variant = 'text', className = '', style = {} }) {
  return (
    <div
      className={`skeleton skeleton--${variant} ${className}`}
      style={{ width, height, ...style }}
    />
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}

export default Skeleton;
