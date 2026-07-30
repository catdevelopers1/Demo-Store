import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from './CategoryProvider';
import { ChevronDown } from 'lucide-react';

export const CategoryNavbarMenu: React.FC = () => {
  const { tree, loading } = useCategories();

  if (loading && tree.length === 0) {
    return (
      <div className="flex items-center gap-6 text-sm text-stone-400">
        <span>Collections...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-8 text-[11px] font-semibold tracking-[0.18em] uppercase text-black">
      {tree.map((node) => (
        <div key={node.id} className="relative group">
          <Link
            to={`/search?category=${node.slug}`}
            className="flex items-center gap-1 hover:opacity-60 transition-opacity py-2"
          >
            <span>{node.name}</span>
            {node.children.length > 0 && <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
          </Link>

          {node.children.length > 0 && (
            <div className="absolute left-0 top-full hidden group-hover:block w-56 bg-white border-0 shadow-none p-4 z-50 space-y-2">
              {node.children.map((child) => (
                <Link
                  key={child.id}
                  to={`/search?category=${child.slug}`}
                  className="block py-1.5 text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-600 hover:text-black transition-colors"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
      <Link to="/search" className="hover:opacity-60 transition-opacity py-2">
        ALL COLLECTIONS
      </Link>
    </div>
  );
};
