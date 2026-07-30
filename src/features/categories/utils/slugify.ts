/**
 * Normalizes an apparel collection title into a clean, SEO-friendly slug
 * e.g., "3-Piece Unstitched Lawn!" -> "3-piece-unstitched-lawn"
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[^a-z0-9]+/g, '-') // Convert spaces/symbols to hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
