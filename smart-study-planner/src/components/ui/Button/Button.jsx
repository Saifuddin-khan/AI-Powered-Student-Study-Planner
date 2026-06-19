import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import './Button.css';

function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  fullWidth = false,
  className = '',
  type     = 'button',
  ...props
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    loading   ? 'btn--loading'  : '',
    fullWidth ? 'btn--full'    : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} disabled={loading || props.disabled} {...props}>
      {loading && <AiOutlineLoading3Quarters className="btn__spinner" size={14} />}
      <span className="btn__text">{children}</span>
    </button>
  );
}

export default React.memo(Button);
