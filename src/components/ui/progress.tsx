import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-gray-200',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full w-full flex-1 bg-indigo-500 transition-all duration-300 ease-in-out',
          indicatorClassName
        )}
        style={{
          transform: `translateX(-${100 - percentage}%)`
        }}
      />
    </div>
  );
};

export { Progress };
