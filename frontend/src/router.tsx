import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";

import { AdminPage } from "@/pages/AdminPage";
import { LoginPage, RecoverPasswordPage, ResetPasswordPage, SignupPage } from "@/pages/AuthPages";
import { DashboardPage } from "@/pages/DashboardPage";
import { ItemsPage } from "@/pages/ItemsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { SettingsPage } from "@/pages/SettingsPage";

const rootRoute = createRootRoute({ component: () => <Outlet /> });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: DashboardPage });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginPage });
const signupRoute = createRoute({ getParentRoute: () => rootRoute, path: "/signup", component: SignupPage });
const recoverRoute = createRoute({ getParentRoute: () => rootRoute, path: "/recover-password", component: RecoverPasswordPage });
const resetRoute = createRoute({ getParentRoute: () => rootRoute, path: "/reset-password", component: ResetPasswordPage });
const portfolioRoute = createRoute({ getParentRoute: () => rootRoute, path: "/portfolio", component: PortfolioPage });
const itemsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/items", component: ItemsPage });
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: "/admin", component: AdminPage });
const settingsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/settings", component: SettingsPage });
const notFoundRoute = createRoute({ getParentRoute: () => rootRoute, path: "*", component: NotFoundPage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  recoverRoute,
  resetRoute,
  portfolioRoute,
  itemsRoute,
  adminRoute,
  settingsRoute,
  notFoundRoute
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
