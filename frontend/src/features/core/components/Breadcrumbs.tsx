import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span className="text-slate-900 dark:text-white">{item.label}</span>
            ) : (
              <>
                {item.href ? (
                  <Link 
                    href={item.href} 
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
                <span className="text-slate-400">/</span>
              </>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
