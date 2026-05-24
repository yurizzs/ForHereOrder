import type { Role } from "../interfaces/user";

const APP_ROOT = "/app";

export const PATHS = {
  // Public Routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",

  // Authenticated
  APP: {
    ROOT: `${APP_ROOT}`,
    VENDOR_DASHBOARD: `${APP_ROOT}/vendor/dashboard`,
    FOOD_CATALOG: `${APP_ROOT}/vendor/catalog`,
    VENDOR_PROFILE: `${APP_ROOT}/vendor/profile`,
    VENDOR_ANALYTICS: `${APP_ROOT}/vendor/analytics`,
    STUDENT_DASHBOARD: `${APP_ROOT}/student/dashboard`,
    STUDENT_ORDERS: `${APP_ROOT}/student/orders`,
    ADMIN_DASHBOARD: `${APP_ROOT}/admin/dashboard`,
    USERS: `${APP_ROOT}/users`,
    USER_DETAIL: `${APP_ROOT}/users/:slug`,
  },
};

export const getDashboardPath = (role: Role): string => {
  if (role === "admin") {
    return PATHS.APP.ADMIN_DASHBOARD;
  }

  if (role === "student") {
    return PATHS.APP.STUDENT_DASHBOARD;
  }

  return PATHS.APP.VENDOR_DASHBOARD;
};
