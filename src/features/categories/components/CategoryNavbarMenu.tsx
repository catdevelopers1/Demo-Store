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
    <div className="flex items-center gap-6 text-sm font-medium text-stone-700">
      {tree.map((node) => (
        <div key={node.id} className="relative group">
          <Link
            to={`/category/${node.slug}`}
            className="flex items-center gap-1 hover:text-emerald-800 transition-colors py-2"
          >
            <span>{node.name}</span>
            {node.children.length > 0 && <ChevronDown className="w-3.5 h-3.5 text-stone-400" />}
          </Link>

          {node.children.length > 0 && (
            <div className="absolute left-0 top-full hidden group-hover:block w-56 bg-white border border-stone-200 rounded-xl shadow-lg p-2 z-50">
              {node.children.map((child) => (
                <Link
                  key={child.id}
                  to={`/category/${child.slug}`}
                  className="block px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg transition-colors"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
      <Link to="/categories" className="hover:text-emerald-800 transition-colors py-2">
        All Collections
      </Link>
    </div>
  );
};
