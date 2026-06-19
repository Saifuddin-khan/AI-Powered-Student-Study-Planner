import React from 'react';
import './Card.css';

function Card({
  children,
  accent,
  hoverable = false,
  glass     = false,
  flat      = false,
  className = '',
  style     = {},
  ...props
}) {
  const classes = [
    'card',
    accent    ? 'card--accented'  : '',
    hoverable ? 'card--hoverable' : '',
    glass     ? 'card--glass'    : '',
    flat      ? 'card--flat'     : '',
    className,
  ].filter(Boolean).join(' ');

  const cardStyle = accent
    ? { '--card-accent': accent, ...style }
    : style;

  return (
    <div className={classes} style={cardStyle} {...props}>
      {children}
    </div>
  );
}

export default Card;
