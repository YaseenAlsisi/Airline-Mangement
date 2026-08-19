# Agent Page Redesign Implementation Plan

## Scope

Redesign the full Agent Data page first-level experience. The attached image should be used only as visual inspiration for the modern grid/card layout. It should not be treated as a source of functional requirements.

The work inside the website must support both English and Arabic through the existing i18n setup.

## Target Files

- `src/pages/agents/AgentDataPage.jsx`
- `src/pages/agents/AgentPassengersModal.jsx`
- `src/locales/en/translation.json`
- `src/locales/ar/translation.json`
- Reuse styling patterns from `src/pages/import/ImportDataPage.jsx`

## Current Context

The current Agent Data page already loads published manifest passengers through `getAllManifestPassengers`. It also includes filtering, passenger totals, inline passenger editing, export, reset, and passenger details modal behavior.

The redesign should preserve useful existing logic where possible, but change the main page presentation from a passenger table-first page into an agent summary-first page.

## Phase 1: Page Data Model

1. Keep loading passenger data from `getAllManifestPassengers`.
2. Deduplicate passenger rows using the existing logic.
3. Group published passengers by `agentNameRaw`.
4. For each agent group, calculate:
   - Agent name
   - Passenger count
   - Total debit
   - Total credit
   - Net summary
   - Available dates for filtering
5. Use the financial values calculated from the Import page data. If the final imported total-with-commission field exists on published rows, use it for the debit total. Otherwise, fall back to the existing debit fields.

## Phase 2: Top Summary Cards

Add two summary cards at the top of the page:

1. Total Agents
   - Count unique agents from published manifest passengers.

2. Total Debit
   - Display the total debit amount.
   - This should represent the total amount calculated with commission from the Import page data.

The cards should be clean, modern, and readable in both English and Arabic.

## Phase 3: Controls Bar

Build a controls bar similar to the one in the Import page.

Required controls:

1. Showing selector
   - Options: `10`, `20`, `50`, `100`
   - Updates the number of visible agents per page.

2. Search bar
   - Search by agent name only.
   - Reset pagination to page 1 when changed.

3. Filter dropdown
   - Same visual style as the Import page dropdown.
   - Only two filter groups:
     - Agent
     - Date
   - Include clear filter behavior.

4. Layout selector
   - Grid layout is the default.
   - List layout is optional via toggle.
   - Use icon-based buttons matching the Import page style.

## Phase 4: Grid Layout

Create the default grid layout inspired by the attached reference image.

Each agent card must include:

1. Agent name
   - Centered at the top.
   - Clear and visually prominent.

2. Debit
   - Show total debit.

3. Credit
   - Show total credit.

4. Summary
   - Show the net result between debit and credit.
   - Example states:
     - Agent owes amount
     - Company owes amount
     - Settled

5. Details button
   - Modern oval button.
   - English label: `View Details`
   - Arabic label: `عرض التفاصيل`
   - Opens the current agent passenger/details modal.

## Phase 5: List Layout

Add a list/table layout for easier scanning.

Suggested columns:

- Agent
- Debit
- Credit
- Summary
- Passengers
- Actions

The action should use the same details behavior as the grid card button.

## Phase 6: Pagination

Use the current pagination behavior or the shared `Pagination` component.

Pagination should apply after:

- Search
- Agent filter
- Date filter
- Layout changes
- Showing selector changes

Reset to page 1 when the result set changes.

## Phase 7: Translation Keys

Add or update English and Arabic translations.

Suggested English keys:

- `agent.totalAgents`: `Total Agents`
- `agent.totalDebit`: `Total Debit`
- `agent.debit`: `Debit`
- `agent.credit`: `Credit`
- `agent.summary`: `Summary`
- `agent.viewDetails`: `View Details`
- `agent.searchAgent`: `Search agent...`
- `agent.filter`: `Filter`
- `agent.grid`: `Grid`
- `agent.list`: `List`
- `agent.owesCompany`: `Agent owes`
- `agent.companyOwes`: `Company owes`
- `agent.settled`: `Settled`

Suggested Arabic keys:

- `agent.totalAgents`: `إجمالي الوكلاء`
- `agent.totalDebit`: `إجمالي المدين`
- `agent.debit`: `مدين`
- `agent.credit`: `دائن`
- `agent.summary`: `الملخص`
- `agent.viewDetails`: `عرض التفاصيل`
- `agent.searchAgent`: `ابحث باسم الوكيل...`
- `agent.filter`: `فلتر`
- `agent.grid`: `مربعات`
- `agent.list`: `قائمة`
- `agent.owesCompany`: `الوكيل عليه`
- `agent.companyOwes`: `للوكيل`
- `agent.settled`: `مسدد`

## Phase 8: Visual Direction

Use the attached image as inspiration for:

- Spacious agent cards
- Soft shadows
- Clean white card surfaces
- Rounded modern buttons
- Clear hierarchy
- Calm dashboard feel

Avoid copying the exact healthcare content, sidebar, names, or unrelated details from the image.

## Phase 9: Safety Notes

- Keep the current details modal available.
- Do not redesign the inside-agent details page yet.
- Do not remove existing backend APIs.
- Do not change import calculation logic unless a missing field makes debit totals impossible to calculate correctly.
- Keep all visible website text translatable.

## Phase 10: Verification Checklist

- Agent page loads without runtime errors.
- Grid layout is the default.
- List layout toggle works.
- Showing selector works with `10`, `20`, `50`, and `100`.
- Search finds agents by name.
- Filter dropdown includes only Agent and Date.
- Total Agents matches unique agent count.
- Total Debit matches published import financial data.
- Each card shows agent name, debit, credit, summary, and details button.
- Details button opens the current passenger/details modal.
- English UI renders correctly.
- Arabic UI renders correctly.
- Layout remains responsive on desktop and mobile.
