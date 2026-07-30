import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Category, CategoryNode, CreateCategoryData, UpdateCategoryData } from '../types';
import { buildCategoryTree } from '../utils';

export interface CategoriesContextValue {
  categories: Category[];
  tree: CategoryNode[];
  loading: boolean;
  error: string | null;
  createCategory: (data: CreateCategoryData) => Promise<boolean>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/v1/categories');
      if (res.ok) {
        const json = (await res.json()) as { success?: boolean; data?: Category[] };
        if (json?.success && json.data) {
          setCategories(json.data);
          setTree(buildCategoryTree(json.data));
        }
      }
    } catch {
      // Ignore offline errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const createCategory = async (data: CreateCategoryData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
        data?: Category;
      };

      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Failed to create category.');
        setLoading(false);
        return false;
      }

      await fetchCategories();
      return true;
    } catch {
      setError('A network error occurred while creating category.');
      setLoading(false);
      return false;
    }
  };

  const updateCategory = async (id: string, data: UpdateCategoryData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
        data?: Category;
      };

      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Failed to update category.');
        setLoading(false);
        return false;
      }

      await fetchCategories();
      return true;
    } catch {
      setError('A network error occurred while updating category.');
      setLoading(false);
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/categories/${id}`, {
        method: 'DELETE',
      });

      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
      };

      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? 'Failed to delete category.');
        setLoading(false);
        return false;
      }

      await fetchCategories();
      return true;
    } catch {
      setError('A network error occurred while deleting category.');
      setLoading(false);
      return false;
    }
  };

  const refreshCategories = async (): Promise<void> => {
    setLoading(true);
    await fetchCategories();
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        tree,
        loading,
        error,
        createCategory,
        updateCategory,
        deleteCategory,
        refreshCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export function useCategories(): CategoriesContextValue {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a <CategoryProvider /> component.');
  }
  return context;
}
