import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'chart' | 'table-row';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}) => {
  const baseClass = 'animate-pulse-subtle bg-muted rounded-xl';

  const variantClasses = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'h-32 rounded-2xl',
    chart: 'h-64 rounded-2xl',
    'table-row': 'h-12 w-full rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  const skeleton = (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClass} ${variantClasses[variant]} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return skeleton;
};

export const CardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card p-6 space-y-4 animate-pulse">
    <div className="flex justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-3 w-24 bg-muted rounded-md" />
        <div className="h-8 w-16 bg-muted rounded-lg" />
      </div>
      <div className="w-10 h-10 rounded-xl bg-muted" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
    <div className="p-5 border-b border-border">
      <div className="h-5 w-36 bg-muted rounded-md" />
    </div>
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <div className="h-3 w-20 bg-muted rounded-md" />
          <div className="h-3 flex-1 bg-muted rounded-md" />
          <div className="h-6 w-24 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const StatsGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);
