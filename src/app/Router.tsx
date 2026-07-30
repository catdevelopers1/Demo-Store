import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { Home } from './Home';
import { AccountView } from './Account';
import { AdminView } from './Admin';
import {
  AuthProvider,
  LoginForm,
  RegisterForm,
  AdminGuard,
  CustomerGuard,
} from '../features/authentication';
import {
  SettingsProvider,
  AdminSettingsEditor,
} from '../features/settings';
import {
  CategoryProvider,
  CategoryGrid,
  AdminCategoryManager,
} from '../features/categories';
import {
  ProductsProvider,
  ProductCatalogGrid,
  ProductDetailView,
  AdminProductWizard,
  AdminImageManager,
} from '../features/products';
import {
  InventoryProvider,
  AdminInventoryManager,
} from '../features/inventory';
import {
  CustomerProvider,
} from '../features/customers';
import {
  SearchProvider,
  CatalogDiscoveryPage,
} from '../features/search';
import {
  CartProvider,
} from '../features/cart';
import {
  DiscountProvider,
  AdminDiscountManager,
} from '../features/discounts';

export const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <CustomerProvider>
        <SettingsProvider>
          <CategoryProvider>
            <ProductsProvider>
              <InventoryProvider>
                <SearchProvider>
                  <DiscountProvider>
                    <CartProvider>
                      <BrowserRouter>
                        <Routes>
                          <Route path="/" element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="login" element={<LoginForm />} />
                            <Route path="register" element={<RegisterForm />} />
                            <Route path="categories" element={<CategoryGrid />} />
                            <Route path="products" element={<ProductCatalogGrid />} />
                            <Route path="product/:slug" element={<ProductDetailView />} />
                            <Route path="search" element={<CatalogDiscoveryPage />} />
                            <Route
                              path="account"
                              element={
                                <CustomerGuard>
                                  <AccountView />
                                </CustomerGuard>
                              }
                            />
                            <Route
                              path="admin"
                              element={
                                <AdminGuard>
                                  <AdminView />
                                </AdminGuard>
                              }
                            />
                            <Route
                              path="admin/settings"
                              element={
                                <AdminGuard>
                                  <AdminSettingsEditor />
                                </AdminGuard>
                              }
                            />
                            <Route
                              path="admin/categories"
                              element={
                                <AdminGuard>
                                  <AdminCategoryManager />
                                </AdminGuard>
                              }
                            />
                            <Route
                              path="admin/products"
                              element={
                                <AdminGuard>
                                  <AdminProductWizard />
                                </AdminGuard>
                              }
                            />
                            <Route
                              path="admin/images"
                              element={
                                <AdminGuard>
                                  <AdminImageManager />
                                </AdminGuard>
                              }
                            />
                            <Route
                              path="admin/inventory"
                              element={
                                <AdminGuard>
                                  <AdminInventoryManager />
                                </AdminGuard>
                              }
                            />
                            <Route
                              path="admin/discounts"
                              element={
                                <AdminGuard>
                                  <AdminDiscountManager />
                                </AdminGuard>
                              }
                            />
                          </Route>
                        </Routes>
                      </BrowserRouter>
                    </CartProvider>
                  </DiscountProvider>
                </SearchProvider>
              </InventoryProvider>
            </ProductsProvider>
          </CategoryProvider>
        </SettingsProvider>
      </CustomerProvider>
    </AuthProvider>
  );
};
