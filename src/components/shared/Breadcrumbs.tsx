import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

interface BreadcrumbItem {
  name: string;
  href: string;
}

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', href: '/' },
    ...pathnames.map((pathname, index) => {
      const href = `/${pathnames.slice(0, index + 1).join('/')}`;
      const name = pathname
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return { name, href };
    })
  ];

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-mystic-indigo mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          {index === 0 ? (
            <Link
              to={breadcrumb.href}
              className="flex items-center hover:text-sunrise-coral transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <ChevronRightIcon className="w-4 h-4 text-soft-grey mx-2" />
              {index === breadcrumbs.length - 1 ? (
                <span className="text-deep-forest font-medium">{breadcrumb.name}</span>
              ) : (
                <Link
                  to={breadcrumb.href}
                  className="hover:text-sunrise-coral transition-colors"
                >
                  {breadcrumb.name}
                </Link>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  );
}