import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

export const ProtectedRoute = ({ requiredPermission }) => {
  // Temporary bypass: allow access to all routes without logging in
  return /*#__PURE__*/_jsxDEV(Outlet, {}, void 0, false);
};