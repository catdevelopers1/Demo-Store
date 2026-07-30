import React, { useState } from 'react';
import { useCategories } from './CategoryProvider';
import { FolderPlus, Edit2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { slugify } from '../utils';

export const AdminCategoryManager: React.FC = () => {
  const { categories, createCategory, updateCategory, deleteCategory, loading, error } =
    useCategories();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId && !slug) {
      setSlug(slugify(val));
    }
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setParentId('');
    setSortOrder(0);
    setEditingId(null);
  };

  const handleEditClick = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? '');
    setParentId(cat.parentId ?? '');
    setSortOrder(cat.sortOrder);
    setEditingId(catId);
    setSuccessMsg(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!name) {
      setFormError('Category Name is required.');
      return;
    }

    if (editingId) {
      const ok = await updateCategory(editingId, {
        name,
        slug: slug || undefined,
        description: description || null,
        parentId: parentId || null,
        sortOrder: Number(sortOrder),
      });

      if (ok) {
        setSuccessMsg(`Category '${name}' updated successfully.`);
        resetForm();
      }
    } else {
      const ok = await createCategory({
        name,
        slug: slug || undefined,
        description: description || null,
        parentId: parentId || null,
        sortOrder: Number(sortOrder),
        isActive: true,
      });

      if (ok) {
        setSuccessMsg(`Category '${name}' created successfully in D1 & KV cache.`);
        resetForm();
      }
    }
  };

  const handleDeleteClick = async (id: string, catName: string) => {
    if (window.confirm(`Are you sure you want to delete category '${catName}'? Child categories will be safely re-parented to top-level.`)) {
      const ok = await deleteCategory(id);
      if (ok) {
        setSuccessMsg(`Category '${catName}' deleted.`);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-8">
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Hierarchical Collection Taxonomy
            </span>
            <h1 className="text-2xl font-bold text-stone-900 mt-1">
              Category & Taxonomy Management
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Manage nested Pakistani clothing categories, SEO slugs, and collection sort order.
            </p>
          </div>
        </div>

        {(error || formError) && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
          >
            {error ?? formError}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Side */}
          <div className="lg:col-span-1 bg-stone-50 p-6 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                {editingId ? 'Edit Category' : 'Create New Category'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="cat-name"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Category Name *
                </label>
                <input
                  id="cat-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. 3-Piece Lawn"
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="cat-slug"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  SEO Slug (Auto-generated) *
                </label>
                <input
                  id="cat-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="3-piece-lawn"
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="cat-parent"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Parent Category (Hierarchy)
                </label>
                <select
                  id="cat-parent"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="">-- Top Level Category --</option>
                  {categories
                    .filter((c) => c.id !== editingId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.slug})
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Prevents self-parenting and circular references via cycle-detection
                </span>
              </div>

              <div>
                <label
                  htmlFor="cat-desc"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Collection Description
                </label>
                <textarea
                  id="cat-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summer lawn collection details..."
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="cat-sort"
                  className="block text-xs font-semibold text-stone-700 mb-1"
                >
                  Sort Order (Ascending)
                </label>
                <input
                  id="cat-sort"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>{editingId ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Table / Tree View Side */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Existing Collections ({categories.length})
              </h2>
              <span className="text-xs text-stone-400">KV Cached (`3600s`)</span>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    <th className="px-4 py-3">Category Name</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Parent</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {categories.map((cat) => {
                    const parent = categories.find((p) => p.id === cat.parentId);
                    return (
                      <tr key={cat.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-stone-900">
                          {cat.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-stone-500">{cat.slug}</td>
                        <td className="px-4 py-3 text-stone-600">
                          {parent ? (
                            <span className="bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded text-[10px]">
                              {parent.name}
                            </span>
                          ) : (
                            <span className="text-stone-400">Root</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-stone-500">{cat.sortOrder}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditClick(cat.id)}
                              aria-label={`Edit ${cat.name}`}
                              className="p-1.5 text-stone-500 hover:text-emerald-800 hover:bg-stone-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteClick(cat.id, cat.name)}
                              aria-label={`Delete ${cat.name}`}
                              className="p-1.5 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                        No categories created yet. Create your first collection above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2 text-xs text-stone-600">
              <AlertTriangle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Cycle Detection Algorithm active: D1 backend automatically blocks any circular reference loops between parent and child categories.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-500 flex items-center justify-between">
          <span>Protected by Role-Based Access Control (RBAC) — Requires `ADMIN` Role Claim</span>
          <span className="font-mono">Milestone 3 (`v0.4.0`)</span>
        </div>
      </div>
    </div>
  );
};
