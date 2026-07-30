import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from './CategoryProvider';
import { Folder, ArrowRight } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { categories, loading } = useCategories();

  const rootCategories = categories.filter((c) => !c.parentId && c.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Pakistani Fashion Collections</h2>
        </div>
        <Link
          to="/categories"
          className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
        >
          <span>View All Categories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading && rootCategories.length === 0 ? (
        <div className="py-8 text-center text-xs text-stone-400">
          Loading Pakistani Apparel Collections...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rootCategories.map((cat) => {
            const subcategories = categories.filter((sub) => sub.parentId === cat.id && sub.isActive);
            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                    <Folder className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-base">{cat.name}</h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {cat.description ?? 'Explore premium Pakistani fabrics and apparel.'}
                  </p>
                </div>

                {subcategories.length > 0 && (
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-1.5">
                    {subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/category/${sub.slug}`}
                        className="text-[11px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 font-medium px-2.5 py-1 rounded-lg transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  to={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline pt-2"
                >
                  <span>Browse {cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
