import React from 'react';
import { cn } from '../../utils/cn';

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  containerClassName?: string;
}

export const Section: React.FC<SectionProps> = ({
  className,
  containerClassName,
  children,
  ...props
}) => {
  return (
    <section className={cn('py-10 md:py-14', className)} {...props}>
      <div className={cn('max-w-6xl mx-auto px-4 md:px-6', containerClassName)}>
        {children}
      </div>
    </section>
  );
};

export default Section;
