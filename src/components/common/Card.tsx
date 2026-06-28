import React from 'react';
import { motion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glassmorphism?: boolean;
  animate?: boolean;
  delay?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  glassmorphism = false,
  animate = true,
  delay = 0,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl border bg-card text-card-foreground shadow-sm p-6 overflow-hidden';
  const glassStyles = glassmorphism 
    ? 'backdrop-blur-md bg-card/70 border-white/10 dark:border-white/5' 
    : 'border-border';
  const hoverStyles = hoverEffect 
    ? 'hover:shadow-md hover:border-muted-foreground/25 hover:-translate-y-0.5 transition-all duration-300' 
    : '';

  if (!animate) {
    return (
      <div 
        className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};
