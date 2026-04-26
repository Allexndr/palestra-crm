import React from 'react';
import clsx from 'clsx';
import './ui.css';

export const Card = ({ children, className, ...props }) => (
  <div className={clsx('card', className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className, ...props }) => (
  <div className={clsx('card-header', className)} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={clsx('card-content', className)} {...props}>
    {children}
  </div>
);
