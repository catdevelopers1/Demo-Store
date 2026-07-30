import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from './CategoryProvider';
import { ChevronRight, Home } from 'lucide-react';
import type { Category } from '../types';

export const CategoryBreadcrumbs: React.FC<{ categorySlug: string }> = ({ categorySlug }) => {
  const { categories } = useCategories();

  const getBreadcrumbTrail = (slug: string): Category[] => {
    const trail: Category[] = [];
    let current = categories.find((c) => c.slug === slug);
    while (current) {
      trail.unshift(current);
      const parentId = current.parentId;
      current = parentId ? categories.find((c) => c.id === parentId) : undefined;
    }
    return trail;
  };

  const trail = getBreadcrumbTrail(categorySlug);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 py-4">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-emerald-800 transition-colors font-medium"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {trail.map((item) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <Link
            to={`/category/${item.slug}`}
            className="hover:text-emerald-800 transition-colors font-medium text-stone-700"
          >
            {item.name}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};
