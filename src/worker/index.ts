import type { ExecutionContext } from '@cloudflare/workers-types';
import { createSuccessResponse, createErrorResponse, handleApiError } from '../core/api';
import { getDb, type Env } from '../core/db';
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleGetSession,
} from '../features/authentication/api';
import {
  handleGetSettings,
  handleUpdateSettings,
} from '../features/settings/api';
import {
  handleGetCategories,
  handleGetCategoryBySlug,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
} from '../features/categories/api';
import {
  handleGetProducts,
  handleGetProductBySlug,
  handleCreateProduct,
  handleGetProductImages,
  handleUploadProductImage,
  handleDeleteProductImage,
  handleSetPrimaryProductImage,
} from '../features/products/api';
import {
  handleGetInventory,
  handleGetInventoryLogs,
  handleAdjustInventory,
  handleCheckStock,
} from '../features/inventory/api';
import {
  handleGetProfile,
  handleGetAddresses,
  handleCreateAddress,
  handleUpdateAddress,
  handleDeleteAddress,
} from '../features/customers/api';
import {
  handleSearchProducts,
} from '../features/search/api';
import {
  handleValidateCart,
} from '../features/cart/api';
import {
  handleValidateCoupon,
  handleGetDiscounts,
  handleCreateDiscount,
  handleUpdateDiscount,
  handleDeleteDiscount,
} from '../features/discounts/api';
import {
  handleCodCheckout,
  handleGetOrderByNumber,
} from '../features/checkout/api';

/**
 * Cloudflare Worker Edge fetch handler for the commerce framework
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      // Health check endpoint
      if (url.pathname === '/api/v1/health') {
        const isDbConfigured = Boolean(env.DB);
        return createSuccessResponse({
          status: 'healthy',
          version: '0.12.0',
          edge: 'Cloudflare Workers',
          dbConfigured: isDbConfigured,
          timestamp: new Date().toISOString(),
        });
      }

      // Check database connection endpoint
      if (url.pathname === '/api/v1/db-check' && request.method === 'GET') {
        const db = getDb(env);
        const result = await db.first<{ count: number }>(
          'SELECT COUNT(*) as count FROM schema_migrations'
        );
        return createSuccessResponse({
          migrationsApplied: result?.count ?? 0,
          status: 'ok',
        });
      }

      // Authentication API endpoints (Milestone 1)
      if (url.pathname === '/api/v1/auth/register' && request.method === 'POST') {
        return await handleRegister(request, env);
      }
      if (url.pathname === '/api/v1/auth/login' && request.method === 'POST') {
        return await handleLogin(request, env);
      }
      if (url.pathname === '/api/v1/auth/logout' && request.method === 'POST') {
        return await handleLogout(env);
      }
      if (url.pathname === '/api/v1/auth/session' && request.method === 'GET') {
        return await handleGetSession(request, env);
      }

      // Store Settings & Configuration API endpoints (Milestone 2)
      if (url.pathname === '/api/v1/settings' && request.method === 'GET') {
        return await handleGetSettings(env);
      }
      if (url.pathname === '/api/v1/admin/settings' && request.method === 'PUT') {
        return await handleUpdateSettings(request, env);
      }

      // Category & Taxonomy API endpoints (Milestone 3)
      if (url.pathname === '/api/v1/categories' && request.method === 'GET') {
        return await handleGetCategories(request, env);
      }
      if (url.pathname.startsWith('/api/v1/categories/') && request.method === 'GET') {
        const slug = url.pathname.replace('/api/v1/categories/', '').trim();
        return await handleGetCategoryBySlug(env, slug);
      }
      if (url.pathname === '/api/v1/admin/categories' && request.method === 'POST') {
        return await handleCreateCategory(request, env);
      }
      if (url.pathname.startsWith('/api/v1/admin/categories/')) {
        const id = url.pathname.replace('/api/v1/admin/categories/', '').trim();
        if (request.method === 'PUT') {
          return await handleUpdateCategory(request, env, id);
        }
        if (request.method === 'DELETE') {
          return await handleDeleteCategory(request, env, id);
        }
      }

      // Product Catalog, Variant Matrix & Image Pipeline API endpoints (Milestones 4 & 5)
      if (url.pathname === '/api/v1/products' && request.method === 'GET') {
        return await handleGetProducts(request, env);
      }
      if (url.pathname.startsWith('/api/v1/products/') && url.pathname.endsWith('/images') && request.method === 'GET') {
        const id = url.pathname.replace('/api/v1/products/', '').replace('/images', '').trim();
        return await handleGetProductImages(env, id);
      }
      if (url.pathname.startsWith('/api/v1/products/') && request.method === 'GET') {
        const slug = url.pathname.replace('/api/v1/products/', '').trim();
        return await handleGetProductBySlug(env, slug);
      }
      if (url.pathname === '/api/v1/admin/products' && request.method === 'POST') {
        return await handleCreateProduct(request, env);
      }
      if (url.pathname === '/api/v1/admin/images/upload' && request.method === 'POST') {
        return await handleUploadProductImage(request, env);
      }
      if (url.pathname.startsWith('/api/v1/admin/images/')) {
        if (url.pathname.endsWith('/primary') && request.method === 'PATCH') {
          const id = url.pathname.replace('/api/v1/admin/images/', '').replace('/primary', '').trim();
          return await handleSetPrimaryProductImage(request, env, id);
        }
        if (request.method === 'DELETE') {
          const id = url.pathname.replace('/api/v1/admin/images/', '').trim();
          return await handleDeleteProductImage(request, env, id);
        }
      }

      // Inventory & Stock Management API endpoints (Milestone 6)
      if (url.pathname === '/api/v1/inventory/check' && request.method === 'GET') {
        return await handleCheckStock(request, env);
      }
      if (url.pathname === '/api/v1/admin/inventory' && request.method === 'GET') {
        return await handleGetInventory(request, env);
      }
      if (url.pathname.startsWith('/api/v1/admin/inventory/')) {
        if (url.pathname.endsWith('/logs') && request.method === 'GET') {
          const id = url.pathname.replace('/api/v1/admin/inventory/', '').replace('/logs', '').trim();
          return await handleGetInventoryLogs(request, env, id);
        }
        if (request.method === 'PATCH') {
          const id = url.pathname.replace('/api/v1/admin/inventory/', '').trim();
          return await handleAdjustInventory(request, env, id);
        }
      }

      // Customer Profile & Pakistani Address Book API endpoints (Milestone 7)
      if (url.pathname === '/api/v1/customer/profile' && request.method === 'GET') {
        return await handleGetProfile(request, env);
      }
      if (url.pathname === '/api/v1/customer/addresses' && request.method === 'GET') {
        return await handleGetAddresses(request, env);
      }
      if (url.pathname === '/api/v1/customer/addresses' && request.method === 'POST') {
        return await handleCreateAddress(request, env);
      }
      if (url.pathname.startsWith('/api/v1/customer/addresses/')) {
        const id = url.pathname.replace('/api/v1/customer/addresses/', '').trim();
        if (request.method === 'PUT') {
          return await handleUpdateAddress(request, env, id);
        }
        if (request.method === 'DELETE') {
          return await handleDeleteAddress(request, env, id);
        }
      }

      // Storefront Product Discovery & FTS5 Edge Search API endpoints (Milestone 8)
      if (url.pathname === '/api/v1/search' && request.method === 'GET') {
        return await handleSearchProducts(request, env);
      }

      // Shopping Cart & Stock Validation API endpoints (Milestone 9)
      if (url.pathname === '/api/v1/cart/validate' && request.method === 'POST') {
        return await handleValidateCart(request, env);
      }

      // Discount Code & Coupon Promotion Engine API endpoints (Milestone 10)
      if (url.pathname === '/api/v1/discounts/validate' && request.method === 'POST') {
        return await handleValidateCoupon(request, env);
      }
      if (url.pathname === '/api/v1/admin/discounts' && request.method === 'GET') {
        return await handleGetDiscounts(request, env);
      }
      if (url.pathname === '/api/v1/admin/discounts' && request.method === 'POST') {
        return await handleCreateDiscount(request, env);
      }
      if (url.pathname.startsWith('/api/v1/admin/discounts/')) {
        const id = url.pathname.replace('/api/v1/admin/discounts/', '').trim();
        if (request.method === 'PUT') {
          return await handleUpdateDiscount(request, env, id);
        }
        if (request.method === 'DELETE') {
          return await handleDeleteDiscount(request, env, id);
        }
      }

      // Cash on Delivery (COD) Checkout Engine API endpoints (Milestone 11)
      if (url.pathname === '/api/v1/checkout/cod' && request.method === 'POST') {
        return await handleCodCheckout(request, env);
      }
      if (url.pathname.startsWith('/api/v1/orders/') && request.method === 'GET') {
        const orderNumber = url.pathname.replace('/api/v1/orders/', '').trim();
        return await handleGetOrderByNumber(env, orderNumber);
      }

      // Default 404 handler for unrecognized API routes
      if (url.pathname.startsWith('/api/v1/')) {
        return createErrorResponse(
          'NOT_FOUND',
          `The requested Edge API route ${url.pathname} was not found.`,
          undefined,
          404
        );
      }

      // Fallback for static assets or unsupported routes
      return new Response('Pakistani Commerce Framework Edge Backend v0.12.0', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    } catch (err) {
      return handleApiError(err);
    }
  },
};
