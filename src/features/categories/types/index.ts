export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description?: string | null;
  imageR2Key?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export interface CreateCategoryData {
  id?: string;
  parentId?: string | null;
  name: string;
  slug?: string;
  description?: string | null;
  imageR2Key?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  parentId?: string | null;
  name?: string;
  slug?: string;
  description?: string | null;
  imageR2Key?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}
