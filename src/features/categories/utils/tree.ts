import type { Category, CategoryNode } from '../types';

/**
 * Builds a recursive category tree from a flat list of categories, sorted by sortOrder ascending
 */
export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const nodeMap = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  // 1. Initialize map of nodes
  for (const cat of categories) {
    nodeMap.set(cat.id, {
      ...cat,
      children: [],
    });
  }

  // 2. Assign children to parents
  for (const node of nodeMap.values()) {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // 3. Recursive sort helper by sortOrder, then name
  function sortNodeList(list: CategoryNode[]): void {
    list.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });
    for (const item of list) {
      if (item.children.length > 0) {
        sortNodeList(item.children);
      }
    }
  }

  sortNodeList(roots);
  return roots;
}

/**
 * Validates that setting `proposedParentId` on `categoryId` will not create a circular reference cycle
 */
export function wouldCreateCycle(
  categoryId: string,
  proposedParentId: string | null,
  categories: Category[]
): boolean {
  if (!proposedParentId) {
    return false;
  }
  if (categoryId === proposedParentId) {
    return true; // Self-parenting is a cycle
  }

  const parentMap = new Map<string, string | null>();
  for (const cat of categories) {
    parentMap.set(cat.id, cat.parentId);
  }

  let curr: string | null = proposedParentId;
  const visited = new Set<string>();

  while (curr) {
    if (curr === categoryId) {
      return true; // Cycle detected!
    }
    if (visited.has(curr)) {
      break;
    }
    visited.add(curr);
    curr = parentMap.get(curr) ?? null;
  }

  return false;
}
