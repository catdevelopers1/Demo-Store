export interface ProductImage {
  id: string;
  productId: string;
  variantId?: string | null;
  r2Key: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt?: string;
}

export interface ImageUploadPayload {
  productId: string;
  variantId?: string | null;
  altText?: string | null;
  filename: string;
  contentType: string;
  base64Data: string;
  isPrimary?: boolean;
  sortOrder?: number;
}
