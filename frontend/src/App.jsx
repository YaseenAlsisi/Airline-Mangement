import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import AgentDataPage from './pages/agents/AgentDataPage';
import AirlineDataPage from './pages/airlines/AirlineDataPage';
import PriceListDataPage from './pages/price-lists/PriceListDataPage';
import TransactionDataPage from './pages/transactions/TransactionDataPage';
import ImportDataPage from './pages/import/ImportDataPage';
import ReportsPage from './pages/reports/ReportsPage';
import NotesDataPage from './pages/notes/NotesDataPage';
import PlaceholderPage from './pages/PlaceholderPage';import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

function App() {
  return (/*#__PURE__*/
    _jsxDEV(BrowserRouter, { children: /*#__PURE__*/
      _jsxDEV(Routes, { children: [/*#__PURE__*/
        _jsxDEV(Route, { path: "/login", element: /*#__PURE__*/_jsxDEV(LoginPage, {}, void 0, false) }, void 0, false), /*#__PURE__*/

        _jsxDEV(Route, { element: /*#__PURE__*/_jsxDEV(ProtectedRoute, {}, void 0, false), children: /*#__PURE__*/
          _jsxDEV(Route, { element: /*#__PURE__*/_jsxDEV(MainLayout, {}, void 0, false), children: [/*#__PURE__*/
            _jsxDEV(Route, { path: "/", element: /*#__PURE__*/_jsxDEV(DashboardPage, {}, void 0, false) }, void 0, false), /*#__PURE__*/

            _jsxDEV(Route, { element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { requiredPermission: "TRANSACTION_CREATE" }, void 0, false), children: /*#__PURE__*/
              _jsxDEV(Route, { path: "/import", element: /*#__PURE__*/_jsxDEV(ImportDataPage, {}, void 0, false) }, void 0, false) }, void 0, false
            ), /*#__PURE__*/

            _jsxDEV(Route, { element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { requiredPermission: "PRICE_VIEW" }, void 0, false), children: /*#__PURE__*/
              _jsxDEV(Route, { path: "/price-lists", element: /*#__PURE__*/_jsxDEV(PriceListDataPage, {}, void 0, false) }, void 0, false) }, void 0, false
            ), /*#__PURE__*/

            _jsxDEV(Route, { element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { requiredPermission: "AGENT_VIEW" }, void 0, false), children: /*#__PURE__*/
              _jsxDEV(Route, { path: "/agents", element: /*#__PURE__*/_jsxDEV(AgentDataPage, {}, void 0, false) }, void 0, false) }, void 0, false
            ), /*#__PURE__*/

            _jsxDEV(Route, { element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { requiredPermission: "AIRLINE_VIEW" }, void 0, false), children: /*#__PURE__*/
              _jsxDEV(Route, { path: "/airlines", element: /*#__PURE__*/_jsxDEV(AirlineDataPage, {}, void 0, false) }, void 0, false) }, void 0, false
            ), /*#__PURE__*/

            _jsxDEV(Route, { element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { requiredPermission: "TRANSACTION_VIEW" }, void 0, false), children: /*#__PURE__*/
              _jsxDEV(Route, { path: "/transactions", element: /*#__PURE__*/_jsxDEV(TransactionDataPage, {}, void 0, false) }, void 0, false) }, void 0, false
            ), /*#__PURE__*/

            _jsxDEV(Route, { element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { requiredPermission: "REPORT_VIEW" }, void 0, false), children: /*#__PURE__*/
              _jsxDEV(Route, { path: "/reports", element: /*#__PURE__*/_jsxDEV(ReportsPage, {}, void 0, false) }, void 0, false) }, void 0, false
            ), /*#__PURE__*/

            _jsxDEV(Route, { element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { requiredPermission: "NOTE_MANAGE" }, void 0, false), children: /*#__PURE__*/
              _jsxDEV(Route, { path: "/notes", element: /*#__PURE__*/_jsxDEV(NotesDataPage, {}, void 0, false) }, void 0, false) }, void 0, false
            ), /*#__PURE__*/

            _jsxDEV(Route, { element: /*#__PURE__*/_jsxDEV(ProtectedRoute, { requiredPermission: "USER_MANAGE" }, void 0, false), children: /*#__PURE__*/
              _jsxDEV(Route, { path: "/settings", element: /*#__PURE__*/_jsxDEV(SettingsPage, {}, void 0, false) }, void 0, false) }, void 0, false
            )] }, void 0, true
          ) }, void 0, false
        )] }, void 0, true
      ) }, void 0, false
    ));

}

export default App;