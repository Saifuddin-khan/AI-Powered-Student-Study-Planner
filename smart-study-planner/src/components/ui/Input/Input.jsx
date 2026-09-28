import React, { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './Input.css';

function Input({
  label,
  error,
  hint,
  icon,
  type      = 'text',
  required  = false,
  className = '',
  textarea  = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword  = type === 'password';
  const inputType   = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputClasses = [
    'input-field__input',
    icon         ? 'input-field__input--with-icon'       : '',
    isPassword   ? 'input-field__input--with-right-icon' : '',
    error        ? 'input-field__input--error'           : '',
    textarea     ? 'input-field__input--textarea'        : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="input-wrapper">
      {label && (
        <label className={`input-wrapper__label${required ? ' input-wrapper__label--required' : ''}`}>
          {label}
        </label>
      )}
      <div className="input-field">
        {icon && <span className="input-field__icon">{icon}</span>}
        {textarea ? (
          <textarea className={inputClasses} {...props} />
        ) : (
          <input type={inputType} className={inputClasses} {...props} />
        )}
        {isPassword && (
          <button
            type="button"
            className="input-field__right"
            onClick={() => setShowPassword(v => !v)}
            tabIndex={-1}
          >
            {showPassword
              ? <AiOutlineEyeInvisible size={16} />
              : <AiOutlineEye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="input-wrapper__error">{error}</span>}
      {hint  && !error && <span className="input-wrapper__hint">{hint}</span>}
    </div>
  );
}

export default Input;
