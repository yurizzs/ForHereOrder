import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PATHS } from "./path";
import { ProtectedRoute, VendorRoute, RoleRoute } from "./guards";
import { useAuth } from "../contexts/AuthContext";
import RootLayout from "./RootLayout";

// Lazy Loading
const Login = React.lazy(() => import("../pages/auth/Login"));
const UserDashboard = React.lazy(() => import("../pages/user/AdminDashboard"));
const VendorDashboard = React.lazy(() => import("../pages/vendor/VendorDashboard"));
const FoodCatalog = React.lazy(() => import("../pages/vendor/FoodCatalog"));
const VendorProfile = React.lazy(() => import("../pages/vendor/VendorProfile"));
const VendorAnalytics = React.lazy(() => import("../pages/vendor/VendorAnalytics"));
const Users = React.lazy(() => import("../pages/user/User"));
const ViewUserDetail = React.lazy(() => import("../pages/user/components/ViewUserModal"));

/**
 * Redirects users to their respective dashboards based on their role.
 */
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (user?.role === "admin") {
    return <Navigate to={PATHS.APP.ADMIN_DASHBOARD} replace />;
  }
  return <Navigate to={PATHS.APP.VENDOR_DASHBOARD} replace />;
};

export const Routes = createBrowserRouter([
  {
    // Root layout — provides AuthProvider to all child routes
    element: <RootLayout />,
    children: [

      // Public / Auth (redirects to dashboard if already logged in)
      {
        element: <VendorRoute />,
        children: [
          {
            path: PATHS.HOME,
            element: <Navigate to={PATHS.LOGIN} replace />,
          },
          {
            path: PATHS.LOGIN,
            element: <Login />,
          },
        ],
      },

      // Authenticated (redirects to login if not logged in)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: PATHS.APP.ROOT,
            children: [
              {
                index: true,
                element: <RoleBasedRedirect />,
              },

              // Admin Only
              {
                element: <RoleRoute allowedRoles={['admin']} />,
                children: [
                  {
                    path: PATHS.APP.ADMIN_DASHBOARD,
                    element: <UserDashboard />,
                  },
                  {
                    path: PATHS.APP.USERS,
                    element: <Users />,
                  },
                  {
                    path: PATHS.APP.USER_DETAIL,
                    element: <ViewUserDetail />,
                  },
                ],
              },

              // Vendor Only
              {
                element: <RoleRoute allowedRoles={['vendor']} />,
                children: [
                  {
                    path: PATHS.APP.VENDOR_DASHBOARD,
                    element: <VendorDashboard />,
                  },
                  {
                    path: PATHS.APP.FOOD_CATALOG,
                    element: <FoodCatalog />,
                  },
                  {
                    path: PATHS.APP.VENDOR_PROFILE,
                    element: <VendorProfile />,
                  },
                  {
                    path: PATHS.APP.VENDOR_ANALYTICS,
                    element: <VendorAnalytics />,
                  },
                ],
              },
            ],
          },
        ],
      },

    ],
  },
]);