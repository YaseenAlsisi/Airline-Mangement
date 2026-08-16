import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginPage } from './pages/auth/LoginPage';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import AgentDataPage from './pages/agents/AgentDataPage';
import PriceListDataPage from './pages/price-lists/PriceListDataPage';
import ImportDataPage from './pages/import/ImportDataPage';
import ManifestFilesPage from './pages/import/ManifestFilesPage';
import ReportsPage from './pages/reports/ReportsPage';
import NotesDataPage from './pages/notes/NotesDataPage';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoute requiredPermission="REPORT_VIEW" />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="IMPORT_VIEW" />}>
              <Route path="/import" element={<ImportDataPage />} />
              <Route path="/files" element={<ManifestFilesPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="PRICE_VIEW" />}>
              <Route path="/price-lists" element={<PriceListDataPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="AGENT_VIEW" />}>
              <Route path="/agents" element={<AgentDataPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="NOTE_VIEW" />}>
              <Route path="/notes" element={<NotesDataPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="USER_MANAGE" />}>
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;