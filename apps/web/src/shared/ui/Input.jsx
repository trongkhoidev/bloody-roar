import React from 'react';
import clsx from 'clsx';

export const Input = ({ 
  label, 
  error, 
  className, 
  containerClassName,
  icon,
  ...props 
}) => {
  return (
    <div className={clsx("space-y-1.5 w-full", containerClassName)}>
      {label && (
        <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider px-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          className={clsx(
            "input",
            icon && "pl-10",
            error && "border-red-500/50 focus:border-red-500",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[11px] text-red-400 px-1 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
};
