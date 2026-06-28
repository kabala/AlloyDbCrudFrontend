import { Suspense, lazy } from "react";
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { ProtectedRoute } from "@/app/protected-route";
import { AppLayout } from "@/components/templates/app-layout";
import { AuthLayout } from "@/components/templates/auth-layout";

const LoginPage = lazy(() =>
  import("@/features/auth/login-page").then((module) => ({ default: module.LoginPage })),
);
const DashboardPage = lazy(() =>
  import("@/features/dashboard/dashboard-page").then((module) => ({
    default: module.DashboardPage,
  })),
);
const BiDashboardPage = lazy(() =>
  import("@/features/bi/bi-dashboard-page").then((module) => ({
    default: module.BiDashboardPage,
  })),
);
const PosPage = lazy(() =>
  import("@/features/pos/pos-page").then((module) => ({ default: module.PosPage })),
);
const CustomersPage = lazy(() =>
  import("@/features/customers/customers-page").then((module) => ({
    default: module.CustomersPage,
  })),
);
const ProductsPage = lazy(() =>
  import("@/features/products/products-page").then((module) => ({
    default: module.ProductsPage,
  })),
);
const InventoryPage = lazy(() =>
  import("@/features/inventory/inventory-page").then((module) => ({
    default: module.InventoryPage,
  })),
);
const SalesPage = lazy(() =>
  import("@/features/sales/sales-page").then((module) => ({ default: module.SalesPage })),
);
const SalesDetailPage = lazy(() =>
  import("@/features/sales/sales-detail-page").then((module) => ({
    default: module.SalesDetailPage,
  })),
);
const ReturnsPage = lazy(() =>
  import("@/features/returns/returns-page").then((module) => ({
    default: module.ReturnsPage,
  })),
);
const UsersPage = lazy(() =>
  import("@/features/users/users-page").then((module) => ({ default: module.UsersPage })),
);

const rootRoute = createRootRoute();

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <AuthLayout>
      <PageLoader>
        <LoginPage />
      </PageLoader>
    </AuthLayout>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <ProtectedRoute>
      <AppLayout>
        <PageLoader>
          <DashboardPage />
        </PageLoader>
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
        <PageLoader>
          <BiDashboardPage />
        </PageLoader>
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
        <PageLoader>
          <PosPage />
        </PageLoader>
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
        <PageLoader>
          <CustomersPage />
        </PageLoader>
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
        <PageLoader>
          <ProductsPage />
        </PageLoader>
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
        <PageLoader>
          <InventoryPage />
        </PageLoader>
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
        <PageLoader>
          <SalesPage />
        </PageLoader>
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
        <PageLoader>
          <SalesDetailPage />
        </PageLoader>
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
        <PageLoader>
          <ReturnsPage />
        </PageLoader>
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
        <PageLoader>
          <UsersPage />
        </PageLoader>
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

function PageLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[40vh] place-items-center text-sm text-muted-foreground">
          Cargando modulo...
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
