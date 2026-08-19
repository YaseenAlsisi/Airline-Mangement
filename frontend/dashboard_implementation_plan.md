# Dashboard Improvement Implementation Plan

## 1. Objective

Rebuild the dashboard into a practical operational and financial command center for the Airline Accounting Management System.

The dashboard should not duplicate the full Reports page. Reports should remain the place for detailed analysis and exports, while the dashboard should quickly answer:

- How many passengers and flights are active in the selected period?
- What are the current revenue, expenses, and net profit?
- Which agents and destinations are driving activity?
- Are there unpaid balances or agent payment risks?
- Are there manifest validation issues that need attention?
- What are the latest uploaded or published manifest files?
- What changed compared with the previous period?

## 2. Current Dashboard Gaps

The current dashboard already has a useful starting point, but several parts do not fully match the system needs:

- The dashboard financial calculations are not aligned with the richer Reports module logic.
- `passengersByAirline` is currently based on `flightNumber`, which is not a real airline dimension.
- The "Today's Flights" section actually returns latest flights, not flights for today.
- Agent and destination filters are free-text inputs, which makes filtering fragile.
- There is no proper custom date range filter.
- There is no previous-period comparison for dashboard KPIs.
- There is no visibility into manifest import status, validation issues, or data quality.
- There is no dashboard view for agent payment balances.
- Some UI labels are hardcoded and not fully covered by Arabic/English translations.

## 3. Recommended Dashboard Structure

### 3.1 Header and Filters

Add a compact filter bar at the top of the dashboard:

- Date preset:
  - Today
  - This week
  - This month
  - Last month
  - Custom range
- Start date and end date for custom filtering.
- Agent dropdown populated from the agents API.
- Destination dropdown populated from backend filter options.
- Service type dropdown populated from backend filter options.
- Refresh button.
- Export Excel button.

The default view should use published manifest data only.

### 3.2 KPI Cards

Replace the current KPI set with metrics that match the accounting and operations workflow:

- Total Passengers
- Total Flights
- Revenue EGP
- Revenue USD
- Expenses EGP
- Net Profit EGP
- Published Manifest Files
- Data Issues

Each KPI should support:

- Current value.
- Previous period value.
- Percentage change.
- Clear positive/negative styling.
- Empty or zero state.

### 3.3 Financial Charts

Add charts focused on financial visibility:

- Revenue over time.
- Profit over time.
- Revenue by destination.
- Revenue by service type.
- Revenue vs expenses.

### 3.4 Operational Charts

Add charts focused on daily operation:

- Passengers by destination.
- Passengers by service type.
- Passengers by passenger category.
- Top agents by passengers.
- Top agents by revenue.
- Flights by departure date.

### 3.5 Operational Tables

Add focused tables below the charts:

- Today or upcoming flights.
- Latest manifest files.
- Top agent balances.
- Data issues summary.

These tables should be action-oriented and should link the user to the relevant feature page where possible.

## 4. Backend Implementation Plan

### 4.1 Align Financial Definitions

Use the same financial definitions used by the Reports module unless the business rules are changed:

- Revenue EGP = `SUM(debit_egp)`
- Revenue USD = `SUM(debit_usd)`
- Expenses EGP = `SUM(credit_egp)`
- Net Profit EGP = `Revenue EGP - Expenses EGP`

Avoid using a different calculation in the dashboard unless it is explicitly required.

### 4.2 Replace or Extend the Dashboard DTO

Create a wider dashboard response DTO, for example:

```java
DashboardOverviewResponse
```

Suggested sections:

- `kpis`
- `charts`
- `flights`
- `latestBatches`
- `agentBalances`
- `dataHealth`
- `filterOptions`

### 4.3 Add Dashboard Overview Endpoint

Add a primary endpoint:

```http
GET /api/v1/dashboard/overview?startDate=&endDate=&agentId=&destination=&serviceType=
```

This endpoint should return all data needed for the main dashboard screen.

### 4.4 Add Filter Options Endpoint

Add:

```http
GET /api/v1/dashboard/filter-options
```

The response should include:

- Agents.
- Destinations.
- Service types.
- Passenger categories.

This removes the need for fragile free-text filters in the frontend.

### 4.5 Fix Flights Query

Replace the current "latest flights" behavior with clear query modes:

- Today's flights.
- Upcoming flights.
- Latest published flights.

The dashboard can show today's flights by default, and fall back to latest published flights when there are no flights today.

### 4.6 Add Data Health Queries

Add dashboard data health metrics:

- Total valid passenger rows.
- Total warning passenger rows.
- Total error passenger rows.
- Rows with missing price.
- Rows with missing agent.
- Draft manifest files.
- Published manifest files.

### 4.7 Add Agent Balance Queries

Use manifest passenger financial data and agent payments to calculate:

- Agent total debit.
- Agent total payments.
- Remaining balance.
- Last payment date.

This should use the `agent_payments` table and should group by agent or raw agent name consistently.

## 5. Frontend Implementation Plan

### 5.1 Suggested File Structure

Refactor the dashboard page into smaller components:

```text
frontend/src/pages/dashboard/
  DashboardPage.jsx
  DashboardComponents.jsx
  components/
    DashboardFilters.jsx
    KpiGrid.jsx
    KpiCard.jsx
    RevenueTrendChart.jsx
    ProfitTrendChart.jsx
    DestinationChart.jsx
    ServiceTypeChart.jsx
    TopAgentsChart.jsx
    FlightsTable.jsx
    LatestBatchesTable.jsx
    AgentBalancesTable.jsx
    DataHealthPanel.jsx
  utils/
    dashboardFormatters.js
```

### 5.2 Update Dashboard API Client

Update `frontend/src/api/dashboard.api.js`:

```js
export const getDashboardOverview = (params) =>
  apiClient.get('/api/v1/dashboard/overview', { params });

export const getDashboardFilterOptions = () =>
  apiClient.get('/api/v1/dashboard/filter-options');
```

### 5.3 Dashboard UI Requirements

The dashboard UI should be:

- Dense enough for operational use.
- Clean and readable in both Arabic and English.
- Fully responsive on desktop, tablet, and mobile.
- RTL-aware when Arabic is selected.
- LTR-aware when English is selected.
- Consistent with the existing layout, sidebar, and reports page.

Recommended states:

- Loading skeletons.
- Empty states.
- Backend error banner.
- Last updated timestamp.
- Disabled export button while loading or when no data exists.

## 6. Arabic and English Translation Requirements

All visible dashboard text must be added to both translation files:

- `frontend/src/locales/en/translation.json`
- `frontend/src/locales/ar/translation.json`

Do not hardcode dashboard labels directly inside React components.

### 6.1 Suggested Translation Keys

Use a structured namespace:

```json
{
  "dashboard": {
    "title": "",
    "subtitle": "",
    "lastUpdated": "",
    "refreshData": "",
    "exportExcel": "",
    "filters": {
      "title": "",
      "datePreset": "",
      "today": "",
      "thisWeek": "",
      "thisMonth": "",
      "lastMonth": "",
      "customRange": "",
      "startDate": "",
      "endDate": "",
      "agent": "",
      "allAgents": "",
      "destination": "",
      "allDestinations": "",
      "serviceType": "",
      "allServiceTypes": "",
      "apply": "",
      "reset": ""
    },
    "kpi": {
      "totalPassengers": "",
      "totalFlights": "",
      "revenueEgp": "",
      "revenueUsd": "",
      "expensesEgp": "",
      "netProfitEgp": "",
      "publishedFiles": "",
      "dataIssues": "",
      "vsPreviousPeriod": ""
    },
    "charts": {
      "revenueOverTime": "",
      "profitOverTime": "",
      "revenueByDestination": "",
      "revenueByServiceType": "",
      "passengersByDestination": "",
      "passengersByServiceType": "",
      "passengersByCategory": "",
      "topAgentsByPassengers": "",
      "topAgentsByRevenue": "",
      "flightsByDate": ""
    },
    "tables": {
      "todaysFlights": "",
      "upcomingFlights": "",
      "latestManifestFiles": "",
      "agentBalances": "",
      "dataIssues": "",
      "flightNumber": "",
      "departureDate": "",
      "arrivalTime": "",
      "from": "",
      "to": "",
      "passengers": "",
      "serviceType": "",
      "fileName": "",
      "status": "",
      "totalRows": "",
      "validRows": "",
      "invalidRows": "",
      "publishedAt": "",
      "agentName": "",
      "totalDebit": "",
      "totalPaid": "",
      "remainingBalance": "",
      "lastPaymentDate": "",
      "issueType": "",
      "count": "",
      "severity": ""
    },
    "empty": {
      "noData": "",
      "noFlights": "",
      "noAgents": "",
      "noIssues": ""
    },
    "errors": {
      "loadFailed": "",
      "exportFailed": ""
    }
  }
}
```

### 6.2 English Copy Guidelines

English labels should be short and operational:

- Use "Revenue EGP", not long explanatory labels.
- Use "Net Profit", not "The total net profit of the selected period".
- Use "Data Issues", not "Problems found in imported passenger data".

### 6.3 Arabic Copy Guidelines

Arabic labels should be clear and natural for daily system use:

- Use concise business Arabic.
- Keep financial terms consistent across Dashboard and Reports.
- Avoid mixing English in Arabic labels unless the business term is already used that way in the system.
- Make sure Arabic labels fit inside KPI cards and table headers.

Suggested Arabic terms:

- Dashboard: لوحة التحكم
- Revenue: الإيرادات
- Expenses: المصروفات
- Net Profit: صافي الربح
- Passengers: الركاب
- Flights: الرحلات
- Agents: الوكلاء
- Data Issues: مشاكل البيانات
- Published Files: الملفات المنشورة
- Remaining Balance: الرصيد المتبقي
- Last Payment: آخر دفعة

## 7. Export Requirements

Improve Excel export so it creates a multi-sheet workbook:

- KPI Summary
- Revenue Over Time
- Destinations
- Service Types
- Top Agents
- Flights
- Agent Balances
- Data Issues

Suggested filename:

```text
AAMS_Dashboard_YYYY-MM-DD.xlsx
```

Exported sheet headers should use the currently selected language where possible.

## 8. Permissions

The dashboard route currently requires `REPORT_VIEW`. Keep that as the base permission.

Additional sections should be conditionally displayed when needed:

- `AGENT_VIEW`: agent balance and agent breakdown sections.
- `IMPORT_VIEW`: latest manifest files and data health sections.
- `REPORT_VIEW`: financial KPIs and charts.

## 9. Testing and Verification Plan

### 9.1 Backend Verification

Test these cases:

- Overview endpoint with no filters.
- Overview endpoint with date range.
- Overview endpoint with agent filter.
- Overview endpoint with destination filter.
- Empty database.
- Rows with null financial values.
- Previous period comparison.
- Data health counts.
- Agent payment balance calculation.

### 9.2 Frontend Verification

Verify:

- Arabic RTL layout.
- English LTR layout.
- Filter apply/reset behavior.
- Loading state.
- Empty state.
- Backend error state.
- Excel export.
- Responsive layout on desktop, tablet, and mobile.
- Long Arabic labels do not overflow KPI cards or table headers.

## 10. Suggested Implementation Phases

### Phase 1: Backend Accuracy

- Align dashboard financial calculations with Reports.
- Add overview endpoint.
- Add filter options endpoint.
- Fix today's flights logic.
- Add previous-period comparison.

### Phase 2: Frontend Refactor

- Split dashboard into smaller components.
- Replace text filters with dropdowns and date range controls.
- Add loading, empty, and error states.
- Update API integration.

### Phase 3: Operational Visibility

- Add latest manifest files.
- Add data health panel.
- Add today's or upcoming flights table.

### Phase 4: Agent Payment Visibility

- Add agent balances.
- Add paid vs outstanding metrics.
- Add last payment date.

### Phase 5: Translations, Export, and QA

- Add all English and Arabic translation keys.
- Remove hardcoded dashboard text.
- Improve Excel export.
- Run frontend build.
- Run backend tests or at least compile checks.
- Manually verify Arabic and English UI.

## 11. Final Recommendation

Implement the dashboard as a high-level control screen for the system.

The Reports page should remain detailed and export-heavy. The Dashboard should show the current business state, financial health, operational activity, agent risk, and data problems in one fast, readable view.
