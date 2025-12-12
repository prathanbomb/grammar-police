import React from 'react';
import { Dialect } from '../types';

interface DialectSelectorProps {
  selectedDialect: Dialect;
  onSelect: (dialect: Dialect) => void;
  disabled?: boolean;
}

export const DialectSelector: React.FC<DialectSelectorProps> = ({ selectedDialect, onSelect, disabled }) => {
  return (
    <div className="flex bg-gray-100 p-1 rounded-lg w-fit shadow-inner">
      <button
        onClick={() => onSelect(Dialect.BRITISH)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
          ${selectedDialect === Dialect.BRITISH
            ? 'bg-white text-royal-900 shadow-sm ring-1 ring-black/5'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className="text-lg">🇬🇧</span>
        <span>British</span>
      </button>
      <button
        onClick={() => onSelect(Dialect.AMERICAN)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
          ${selectedDialect === Dialect.AMERICAN
            ? 'bg-white text-royal-900 shadow-sm ring-1 ring-black/5'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className="text-lg">🇺🇸</span>
        <span>American</span>
      </button>
    </div>
  );
};