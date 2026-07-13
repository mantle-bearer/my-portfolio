import { createRootRoute, createRoute, createRouter, Navigate, Outlet } from "@tanstack/react-router";

import { AdminPage } from "@/pages/AdminPage";
import { LoginPage, RecoverPasswordPage, ResetPasswordPage, SignupPage } from "@/pages/AuthPages";
import { DashboardPage } from "@/pages/DashboardPage";
import { ItemsPage } from "@/pages/ItemsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PortfolioPage } from "@/pages/PortfolioPage";
import { SettingsPage } from "@/pages/SettingsPage";
import {
  ContentAdminPage,
  ContentPreviewPage,
  type ContentScreen
} from "@/pages/ContentAdminPage";
import { PostDetailPage, ProjectDetailPage } from "@/pages/PortfolioDetailPages";

const rootRoute = createRootRoute({ component: () => <Outlet /> });
const PortfolioRedirect = () => (
  <Navigate to="/" hash={window.location.hash.replace(/^#/, "")} replace />
);
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: PortfolioPage });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginPage });
const signupRoute = createRoute({ getParentRoute: () => rootRoute, path: "/signup", component: SignupPage });
const recoverRoute = createRoute({ getParentRoute: () => rootRoute, path: "/recover-password", component: RecoverPasswordPage });
const resetRoute = createRoute({ getParentRoute: () => rootRoute, path: "/reset-password", component: ResetPasswordPage });
const portfolioRoute = createRoute({ getParentRoute: () => rootRoute, path: "/portfolio", component: PortfolioRedirect });
const dashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: "/dashboard", component: DashboardPage });
const dashboardItemsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/dashboard/items", component: ItemsPage });
const dashboardUsersRoute = createRoute({ getParentRoute: () => rootRoute, path: "/dashboard/users", component: AdminPage });
const dashboardSettingsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/dashboard/settings", component: SettingsPage });
const contentRootRoute = createRoute({ getParentRoute: () => rootRoute, path: "/dashboard/content", component: () => <Navigate to="/dashboard/content/profile" replace /> });
const contentRoutes = (["profile", "about", "stacks", "services", "projects", "posts", "media", "contact", "seo"] as ContentScreen[]).map((screen) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: `/dashboard/content/${screen}`,
    component: () => <ContentAdminPage screen={screen} />
  })
);
const contentPreviewRoute = createRoute({ getParentRoute: () => rootRoute, path: "/dashboard/content/preview", component: ContentPreviewPage });
const postDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: "/blog/$slug", component: PostDetailPage });
const projectDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: "/projects/$slug", component: ProjectDetailPage });
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
  dashboardRoute,
  dashboardItemsRoute,
  dashboardUsersRoute,
  dashboardSettingsRoute,
  contentRootRoute,
  ...contentRoutes,
  contentPreviewRoute,
  postDetailRoute,
  projectDetailRoute,
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
