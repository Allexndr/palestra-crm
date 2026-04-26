import React from 'react';
import clsx from 'clsx';
import './ui.css';

export const Avatar = ({ src, alt = "Avatar", size = "md", fallback, className }) => {
  return (
    <div className={clsx('avatar', `avatar-${size}`, className)}>
      {src ? (
        <img src={src} alt={alt} className="avatar-img" />
      ) : (
        <div className="avatar-fallback">{fallback || alt.charAt(0)}</div>
      )}
    </div>
  );
};

export const Badge = ({ children, variant = 'default', className }) => {
  return (
    <span className={clsx('badge', `badge-${variant}`, className)}>
      {children}
    </span>
  );
};
