import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

export const MainLayout = () => {
  return (/*#__PURE__*/
    _jsxDEV("div", { children: [/*#__PURE__*/
      _jsxDEV("div", { className: "hidden lg:fixed lg:inset-y-0 start-0 lg:z-50 lg:flex lg:w-72 lg:flex-col", children: /*#__PURE__*/
        _jsxDEV(Sidebar, {}, void 0, false) }, void 0, false
      ), /*#__PURE__*/
      _jsxDEV("div", { className: "lg:ps-72 flex flex-col min-h-screen", children: [/*#__PURE__*/
        _jsxDEV(Header, {}, void 0, false), /*#__PURE__*/
        _jsxDEV("main", { className: "py-10 flex-1", children: /*#__PURE__*/
          _jsxDEV("div", { className: "px-4 sm:px-6 lg:px-8", children: /*#__PURE__*/
            _jsxDEV(Outlet, {}, void 0, false) }, void 0, false
          ) }, void 0, false
        )] }, void 0, true
      )] }, void 0, true
    ));

};