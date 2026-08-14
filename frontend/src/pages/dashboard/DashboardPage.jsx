import React from 'react';
import { useAuthStore } from '../../store/authStore';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

export const DashboardPage = () => {
  const { user } = useAuthStore();

  return (/*#__PURE__*/
    _jsxDEV("div", { children: [/*#__PURE__*/
      _jsxDEV("h2", { className: "text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight", children: "Dashboard" }, void 0, false

      ), /*#__PURE__*/
      _jsxDEV("div", { className: "mt-4 bg-white shadow sm:rounded-lg", children: /*#__PURE__*/
        _jsxDEV("div", { className: "px-4 py-5 sm:p-6", children: [/*#__PURE__*/
          _jsxDEV("h3", { className: "text-base font-semibold leading-6 text-gray-900", children: ["Welcome back, ",
            user?.fullName || user?.username, "!"] }, void 0, true
          ), /*#__PURE__*/
          _jsxDEV("div", { className: "mt-2 max-w-xl text-sm text-gray-500", children: /*#__PURE__*/
            _jsxDEV("p", { children: "This is the foundational dashboard placeholder. Future phases will populate this with high-level metrics such as total revenue, profit, outstanding balances, and recent imports." }, void 0, false

            ) }, void 0, false
          )] }, void 0, true
        ) }, void 0, false
      )] }, void 0, true
    ));

};