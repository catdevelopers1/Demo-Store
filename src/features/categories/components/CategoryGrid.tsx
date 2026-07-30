import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from './CategoryProvider';

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
          to="/search"
          className="text-xs font-bold tracking-[0.18em] uppercase text-black hover:underline"
        >
          <span>VIEW ALL</span>
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
                className="bg-[#F6F6F6] p-8 flex flex-col justify-between gap-6 group hover:bg-[#EFEFEF] transition-colors"
              >
                <div>
                  <h3 className="font-bold tracking-[0.18em] uppercase text-black text-lg group-hover:underline">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {cat.description ?? 'Explore premium Pakistani fabrics and apparel.'}
                  </p>
                </div>

                {subcategories.length > 0 && (
                  <div className="pt-4 border-t border-[#EAEAEA] flex flex-wrap gap-2">
                    {subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/search?category=${sub.slug}`}
                        className="text-[10px] font-semibold tracking-[0.15em] uppercase bg-white hover:bg-black hover:text-white text-black px-3 py-1.5 transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  to={`/search?category=${cat.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold tracking-[0.18em] uppercase text-black hover:underline pt-2"
                >
                  <span>SHOP COLLECTION</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
