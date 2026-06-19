import React, { useState } from 'react';
import { MdSearch, MdClose } from 'react-icons/md';
import useDebounce from '../../hooks/useDebounce';
import './SearchBar.css';

function SearchBar({ placeholder = 'Search…', onSearch, className = '' }) {
  const [value, setValue] = useState('');
  const debounced = useDebounce(value, 400);

  React.useEffect(() => {
    if (onSearch) onSearch(debounced);
  }, [debounced, onSearch]);

  const clear = () => {
    setValue('');
    if (onSearch) onSearch('');
  };

  return (
    <div className={`search-bar ${className}`}>
      <span className="search-bar__icon"><MdSearch size={16} /></span>
      <input
        className="search-bar__input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button className="search-bar__clear" onClick={clear} aria-label="Clear search">
          <MdClose size={14} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
