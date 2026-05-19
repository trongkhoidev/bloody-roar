import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className, elevated = false, ...props }) => {
  return (
    <div 
      className={clsx(
        elevated ? 'card-elevated' : 'card',
        'overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => (
  <div className={clsx("p-6 border-b border-border", className)} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className, ...props }) => (
  <div className={clsx("p-6", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={clsx("p-6 border-t border-border bg-bg-tertiary", className)} {...props}>
    {children}
  </div>
);
