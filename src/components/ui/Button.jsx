import React from 'react';
import clsx from 'clsx';
import './ui.css';

export const Button = ({ variant = 'primary', size = 'md', className, children, ...props }) => {
  const baseClasses = 'btn';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;

  return (
    <button className={clsx(baseClasses, variantClasses, sizeClasses, className)} {...props}>
      {children}
    </button>
  );
};
