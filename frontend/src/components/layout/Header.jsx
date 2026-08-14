import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { logout as logoutApi } from '../../api/auth.api';
import { useNavigate } from 'react-router-dom';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

export const Header = () => {
  const { user, logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (refreshToken) await logoutApi(refreshToken);
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (/*#__PURE__*/
    _jsxDEV("header", { className: "flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 justify-end", children: /*#__PURE__*/
      _jsxDEV("div", { className: "flex items-center gap-x-4 lg:gap-x-6", children: [/*#__PURE__*/
        _jsxDEV("div", { className: "text-sm font-semibold leading-6 text-gray-900", children: [
          user?.fullName, " (", user?.roles.map((r) => r.name).join(', '), ")"] }, void 0, true
        ), /*#__PURE__*/
        _jsxDEV("button", {
          onClick: handleLogout,
          className: "rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50", children:
          "Logout" }, void 0, false

        )] }, void 0, true
      ) }, void 0, false
    ));

};