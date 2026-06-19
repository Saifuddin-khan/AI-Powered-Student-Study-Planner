import React from 'react';
import Button from '../ui/Button/Button';
import './PageHeader.css';

function PageHeader({ title, subtitle, accentColor, action, extra }) {
  return (
    <div className="page-header">
      <div className="page-header__left">
        <div className="page-header__title-row">
          {accentColor && (
            <div
              className="page-header__accent"
              style={{ background: accentColor }}
            />
          )}
          <h1 className="page-header__title">{title}</h1>
        </div>
        {subtitle && (
          <p className="page-header__subtitle">{subtitle}</p>
        )}
      </div>

      {(action || extra) && (
        <div className="page-header__right">
          {extra}
          {action && (
            <Button onClick={action.onClick} variant={action.variant || 'primary'} size={action.size}>
              {action.icon && action.icon}
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
