const APP_ROOT = "/app";

export const PATHS = {
  // Public Routes
  HOME: "/",
  LOGIN: "/login",

  // Authenticated
  APP: {
    ROOT: `${APP_ROOT}`,
    VENDOR_DASHBOARD: `${APP_ROOT}/vendor/dashboard`,
    FOOD_CATALOG: `${APP_ROOT}/vendor/catalog`,
    VENDOR_PROFILE: `${APP_ROOT}/vendor/profile`,
    VENDOR_ANALYTICS: `${APP_ROOT}/vendor/analytics`,
    ADMIN_DASHBOARD: `${APP_ROOT}/admin/dashboard`,
    USERS: `${APP_ROOT}/users`,
    USER_DETAIL: `${APP_ROOT}/users/:slug`,
  },
};