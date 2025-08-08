import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  const navigate = useNavigate();
  return (
    <nav aria-label="Breadcrumb" className={cn('mb-4', className)}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {item.href ? (
              <button
                onClick={() => navigate(item.href!)}
                className="hover:text-gray-900 underline-offset-2 hover:underline"
              >
                {item.label}
              </button>
            ) : (
              <span className="font-medium text-gray-900">{item.label}</span>
            )}
            {idx < items.length - 1 && <span className="text-gray-400">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
