import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export const StorefrontSearchBar: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = keyword.trim();
    if (clean) {
      navigate(`/search?q=${encodeURIComponent(clean)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
        <Search className="w-4 h-4" />
      </span>
      <input
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search Lawn, Khaddar, SKUs..."
        aria-label="Search catalog"
        className="w-full pl-9 pr-4 py-1.5 text-xs border border-stone-200 rounded-xl bg-stone-50 hover:bg-white focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
      />
    </form>
  );
};
