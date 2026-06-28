import React from 'react';
import type { ReportStatus, SeverityLevel, PriorityLevel } from '../../types';

interface BadgeProps {
  type: 'status' | 'severity' | 'priority';
  value: ReportStatus | SeverityLevel | PriorityLevel | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold select-none border transition-all';
  
  let styles = 'bg-muted text-muted-foreground border-border';

  if (type === 'status') {
    switch (value as ReportStatus) {
      case 'Menunggu Verifikasi Admin':
        styles = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 dark:text-yellow-400';
        break;
      case 'Diverifikasi':
      case 'Menunggu Penugasan Teknisi':
        styles = 'bg-sky-500/10 text-sky-500 border-sky-500/20';
        break;
      case 'Sedang Diproses':
        styles = 'bg-purple-500/10 text-purple-500 border-purple-500/20';
        break;
      case 'Selesai':
        styles = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400';
        break;
      case 'Ditolak':
        styles = 'bg-red-500/10 text-red-500 border-red-500/20 dark:text-red-400';
        break;
      default:
        break;
    }
  } else if (type === 'severity') {
    switch (value as SeverityLevel) {
      case 'Ringan':
        styles = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400';
        break;
      case 'Sedang':
        styles = 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:text-amber-400';
        break;
      case 'Berat':
        styles = 'bg-red-500/10 text-red-500 border-red-500/20 dark:text-red-400';
        break;
      default:
        break;
    }
  } else if (type === 'priority') {
    switch (value as PriorityLevel) {
      case 'Rendah':
        styles = 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        break;
      case 'Sedang':
        styles = 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:text-amber-400';
        break;
      case 'Tinggi':
        styles = 'bg-red-500/10 text-red-500 border-red-500/20 dark:text-red-400';
        break;
      default:
        break;
    }
  }

  // Indonesian translation helpers for display
  let displayText = value.toString();
  if (type === 'priority') {
    displayText = `Prioritas: ${value}`;
  }

  return (
    <span className={`${baseStyles} ${styles} ${className}`}>
      {displayText}
    </span>
  );
};
