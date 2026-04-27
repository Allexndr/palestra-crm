import React from 'react';
import { LockKeyhole, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const LockedFeature = ({ title, description, onConfigure }) => (
  <div className="locked-feature">
    <div className="locked-feature__icon" aria-hidden>
      <LockKeyhole size={28} />
    </div>
    <h1>{title}</h1>
    <p>{description}</p>
    <Button variant="primary" onClick={onConfigure} className="gap-2">
      Настроить тариф <ArrowRight size={18} />
    </Button>
  </div>
);
