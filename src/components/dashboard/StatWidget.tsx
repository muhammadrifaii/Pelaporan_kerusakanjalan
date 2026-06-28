import React from 'react';
import { Card } from '../common/Card';

interface StatWidgetProps {
  title: string;
  value: number | string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'slate';
  delay?: number;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'primary',
  delay = 0
}) => {
  const colorStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    slate: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <Card hoverEffect delay={delay} className="relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
            {title}
          </p>
          <h3 className="text-3xl font-bold mt-2 tracking-tight">
            {value}
          </h3>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                changeType === 'positive' ? 'bg-success/10 text-success' :
                changeType === 'negative' ? 'bg-danger/10 text-danger' :
                'bg-muted text-muted-foreground'
              }`}>
                {change}
              </span>
              <span className="text-[10px] text-muted-foreground">dari bulan lalu</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl border ${colorStyles[color]} transition-transform duration-500 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      
      {/* Decorative subtle gradient background on hover */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 blur-xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
    </Card>
  );
};
