import React from 'react';
import { Gamepad2, Home, Crown } from 'lucide-react';

export default function AccountBadge({ type, size = 'sm', showIcon = true }) {
  const normType = (type || '').toUpperCase();

  let label = 'Home Account';
  let Icon = Home;
  let colorClasses = 'bg-sky-950/60 text-sky-400 border-sky-500/30';

  if (normType === 'SIGN') {
    label = 'Sign Account';
    Icon = Gamepad2;
    colorClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30';
  } else if (normType === 'FULL') {
    label = 'Full Account';
    Icon = Crown;
    colorClasses = 'bg-amber-950/60 text-amber-400 border-amber-500/30';
  }

  const sizeClasses = size === 'lg' ? 'text-sm px-3 py-1 gap-1.5' : 'text-xs px-2.5 py-0.5 gap-1.5';

  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${colorClasses} ${sizeClasses}`}>
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      <span>{label}</span>
    </span>
  );
}
