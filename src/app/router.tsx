import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/protected-route";
import { AppLayout } from "@/components/templates/app-layout";
import { AuthLayout } from "@/components/templates/auth-layout";
import { BiDashboardPage } from "@/features/bi/bi-dashboard-page";
import { CustomersPage } from "@/features/customers/customers-page";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { InventoryPage } from "@/features/inventory/inventory-page";
import { LoginPage } from "@/features/auth/login-page";
import { PosPage } from "@/features/pos/pos-page";
import { ProductsPage } from "@/features/products/products-page";
import { ReturnsPage } from "@/features/returns/returns-page";
import { SalesDetailPage } from "@/features/sales/sales-detail-page";
import { SalesPage } from "@/features/sales/sales-page";
import { UsersPage } from "@/features/users/users-page";

const rootRoute = createRootRoute();

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

const biRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/bi",
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <BiDashboardPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

const posRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos",
  component: () => (
    <ProtectedRoute roles={["Superadmin", "Vendedor"]}>
      <AppLayout>
        <PosPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customers",
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <CustomersPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <ProductsPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory",
  component: () => (
    <ProtectedRoute roles={["Superadmin", "Vendedor"]}>
      <AppLayout>
        <InventoryPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

const salesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sales",
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <SalesPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

export const salesDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sales/$transactionId",
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <SalesDetailPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

const returnsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/returns",
  component: () => (
    <ProtectedRoute roles={["Superadmin", "Vendedor"]}>
      <AppLayout>
        <ReturnsPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: () => (
    <ProtectedRoute roles={["Superadmin"]}>
      <AppLayout>
        <UsersPage />
      </AppLayout>
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  biRoute,
  posRoute,
  customersRoute,
  productsRoute,
  inventoryRoute,
  salesRoute,
  salesDetailRoute,
  returnsRoute,
  usersRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
