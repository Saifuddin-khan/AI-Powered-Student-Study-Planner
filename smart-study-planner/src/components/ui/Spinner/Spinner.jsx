import React from 'react';
import './Spinner.css';

function Spinner({ size = 'md', fullPage = false }) {
  return (
    <div className={`spinner-wrap${fullPage ? ' spinner-wrap--fullpage' : ''}`}>
      <div className={`spinner spinner--${size}`} role="status" aria-label="Loading" />
    </div>
  );
}

export default Spinner;
