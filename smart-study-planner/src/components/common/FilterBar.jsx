import React from 'react';
import './FilterBar.css';

function FilterBar({ filters = [], active, onChange, label }) {
  return (
    <div className="filter-bar">
      {label && <span className="filter-bar__label">{label}</span>}
      {filters.map((f) => {
        const value = typeof f === 'string' ? f : f.value;
        const display = typeof f === 'string' ? f : f.label;
        return (
          <button
            key={value}
            className={`filter-bar__btn${active === value ? ' filter-bar__btn--active' : ''}`}
            onClick={() => onChange && onChange(value)}
          >
            {f.icon && f.icon}
            {display}
          </button>
        );
      })}
    </div>
  );
}

export default FilterBar;
