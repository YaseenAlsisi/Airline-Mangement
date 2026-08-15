# Excel Passenger Manifest Import and Agent Data Dashboard Implementation Plan

## 1. Goal

Build a daily Excel import workflow for passenger departure manifests. The user uploads the Excel file, the system previews all imported rows in a large modern editable table, allows manual corrections, and then exports/publishes the cleaned data into Agent Data so each agent can be opened to view their passengers and travel details.

The feature must support both English and Arabic UI, including RTL layout for Arabic data.

## 2. Current Project Context

- Frontend: React + Vite + Tailwind CSS.
- Backend: Spring Boot 3.3.2, Java 21, JPA, Flyway, PostgreSQL.
- Existing import page: `frontend/src/pages/import/ImportDataPage.jsx`.
- Existing import API: `frontend/src/api/import.api.js`.
- Existing backend import service: `ExcelImportService`.
- Existing agents page: `frontend/src/pages/agents/AgentDataPage.jsx`.
- Existing agents API: `/api/v1/agents`.

The current import flow imports ticket transactions with columns like ticket number, PNR, airline code, fares, and tax. The new Excel file is a passenger manifest and should not be forced into the existing `transactions` table because the data model is different.

## 3. Source Excel Shape

The sample workbook contains Arabic headers and around 568 rows. Important columns are:

| Excel Header | Internal Field |
| --- | --- |
| الاسم | passengerName |
| تاريخ الميلاد | birthDate |
| الرقم القومي | nationalId |
| رقم الجواز | passportNumber |
| المنفذ | departurePort |
| جهه المغادره | destination |
| رقم الرحله | flightNumber |
| تاريخ المغادرة | departureDate |
| ميعاد الوصول | arrivalTime |
| الوكيل | agentName |
| مورد الاستثمار | investmentSupplier |
| نوع الخدمه | serviceType |
| ملاحظات | note1 / passengerCategory |
| ملاحظات | note2 |
| ملاحظات | note3 |
| ملاحظات | note4 |
| مدين دولار | debitUsd |
| دائن دولار | creditUsd |
| مدين مصري | debitEgp |
| دائن مصري | creditEgp |

Important parsing note: the workbook has repeated `ملاحظات` headers, so parsing must use column position plus normalized header aliases, not only header text.

## 4. Recommended Data Model

Add a new manifest domain instead of modifying `transactions`.

### 4.1 Tables

Create migration `V14__passenger_manifest_import_schema.sql`.

#### `manifest_import_batches`

Stores each uploaded file/import session.

Columns:

- `id UUID PRIMARY KEY`
- `original_filename VARCHAR(255) NOT NULL`
- `status VARCHAR(50) NOT NULL DEFAULT 'DRAFT'`
- `total_rows INT NOT NULL DEFAULT 0`
- `valid_rows INT NOT NULL DEFAULT 0`
- `invalid_rows INT NOT NULL DEFAULT 0`
- `uploaded_by UUID NULL`
- `published_at TIMESTAMP NULL`
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`

Statuses:

- `DRAFT`: parsed and editable, not yet pushed to Agent Data.
- `PUBLISHED`: exported to Agent Data.
- `CANCELLED`: discarded.

#### `manifest_passengers`

Stores each passenger row from a batch.

Columns:

- `id UUID PRIMARY KEY`
- `batch_id UUID NOT NULL REFERENCES manifest_import_batches(id) ON DELETE CASCADE`
- `row_number INT NOT NULL`
- `passenger_name VARCHAR(255) NOT NULL`
- `birth_date DATE NULL`
- `national_id VARCHAR(50) NULL`
- `passport_number VARCHAR(50) NULL`
- `departure_port VARCHAR(255) NULL`
- `destination VARCHAR(255) NULL`
- `flight_number VARCHAR(100) NULL`
- `departure_date DATE NULL`
- `arrival_time TIME NULL`
- `agent_id UUID NULL REFERENCES agents(id) ON DELETE SET NULL`
- `agent_name_raw VARCHAR(255) NULL`
- `investment_supplier VARCHAR(255) NULL`
- `service_type VARCHAR(255) NULL`
- `passenger_category VARCHAR(100) NULL`
- `note_2 TEXT NULL`
- `note_3 TEXT NULL`
- `note_4 TEXT NULL`
- `debit_usd DECIMAL(15,2) DEFAULT 0`
- `credit_usd DECIMAL(15,2) DEFAULT 0`
- `debit_egp DECIMAL(15,2) DEFAULT 0`
- `credit_egp DECIMAL(15,2) DEFAULT 0`
- `validation_status VARCHAR(50) NOT NULL DEFAULT 'VALID'`
- `validation_errors TEXT NULL`
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`

Recommended indexes:

- `(batch_id)`
- `(agent_id)`
- `(agent_name_raw)`
- `(departure_date)`
- `(passport_number)`
- `(departure_port, destination)`

## 5. Agent Matching Strategy

When parsing the Excel file:

1. Normalize agent names by trimming spaces, normalizing Arabic variants where needed, and removing duplicate internal spacing.
2. Search existing `agents.name` by normalized value.
3. If found, set `agent_id`.
4. If not found, create a new active agent automatically with:
   - `name = Excel agent name`
   - `code = generated slug/code`, for example `AGT-ABO-ATYA` or fallback `AGT-0001`
   - `status = ACTIVE`
   - `currency = USD`
5. Keep the raw Excel value in `agent_name_raw` in all cases.

This satisfies the requirement that every Excel agent appears in Agent Data.

Important: if automatic creation feels too risky later, add a confirmation step listing unknown agents before publish. For the first implementation, automatic creation is acceptable because the user asked for agents to be added to the agent list.

## 6. Backend Implementation

### 6.1 New package

Create:

- `backend/src/main/java/com/ldi/aams/manifest/ManifestImportController.java`
- `backend/src/main/java/com/ldi/aams/manifest/ManifestImportService.java`
- `backend/src/main/java/com/ldi/aams/manifest/ManifestDto.java`
- `backend/src/main/java/com/ldi/aams/manifest/internal/ManifestImportBatch.java`
- `backend/src/main/java/com/ldi/aams/manifest/internal/ManifestPassenger.java`
- `backend/src/main/java/com/ldi/aams/manifest/internal/ManifestImportBatchRepository.java`
- `backend/src/main/java/com/ldi/aams/manifest/internal/ManifestPassengerRepository.java`
- `backend/src/main/java/com/ldi/aams/manifest/internal/ManifestMapper.java`
- `backend/src/main/java/com/ldi/aams/manifest/package-info.java`

### 6.2 API endpoints

Add endpoints under `/api/v1/manifest-imports`.

#### Upload and parse

`POST /api/v1/manifest-imports/preview`

Input:

- Multipart file field: `file`

Behavior:

- Parse workbook.
- Create a `DRAFT` batch.
- Save all rows.
- Auto-create/match agents.
- Return batch metadata and editable rows.

Response:

```json
{
  "batchId": "uuid",
  "status": "DRAFT",
  "totalRows": 567,
  "validRows": 560,
  "invalidRows": 7,
  "rows": []
}
```

#### List rows for editable table

`GET /api/v1/manifest-imports/{batchId}/rows`

Query params:

- `page`
- `size`
- `agentId`
- `search`
- `validationStatus`

#### Update one row

`PUT /api/v1/manifest-imports/{batchId}/rows/{rowId}`

Use this when the user edits a row in the preview table.

#### Bulk update rows

`PATCH /api/v1/manifest-imports/{batchId}/rows`

Use this for batch table edits if the frontend saves multiple edited cells at once.

#### Publish/export batch to Agent Data

`POST /api/v1/manifest-imports/{batchId}/publish`

Behavior:

- Revalidate rows.
- Keep invalid rows blocked from publish or return a clear error list.
- Mark batch as `PUBLISHED`.
- Rows are now visible in Agent Data and dashboard views.

#### Agent passenger details

`GET /api/v1/agents/{agentId}/manifest-passengers`

Query params:

- `fromDate`
- `toDate`
- `destination`
- `departurePort`
- `flightNumber`
- `page`
- `size`

Returns passengers for one selected agent.

#### Agent manifest summary

`GET /api/v1/agents/manifest-summary`

Returns one row per agent:

- agent id
- agent name
- passenger count
- nearest departure date
- destinations count/list
- invalid/unpublished count if useful

This powers the Agent Data page cards/table.

### 6.3 Excel parsing rules

Use Apache POI already available in the backend.

Rules:

- Use first non-empty row as headers.
- Normalize Arabic headers:
  - trim spaces
  - normalize `جهه المغادره`, `جهة المغادرة`, and equivalent spellings to `destination`
  - normalize `نوع الخدمه` and `نوع الخدمة` to `serviceType`
  - normalize `ميعاد الوصول` to `arrivalTime`
- For duplicated `ملاحظات`, map by position:
  - first occurrence: `passengerCategory`
  - second occurrence: `note2`
  - third occurrence: `note3`
  - fourth occurrence: `note4`
- Preserve unknown extra columns only if needed later. For now, ignore fully empty trailing columns.
- Parse dates from Excel date cells and ISO-like strings.
- Parse time from Excel time cells, `HH:mm:ss`, or `HH:mm`.
- Keep national ID and passport number as strings, never numbers.

### 6.4 Validation rules

Required:

- passenger name
- passport number
- agent name
- departure date

Recommended warnings:

- missing birth date
- unknown/empty departure port
- unknown/empty destination
- missing flight number
- unknown passenger category

Passenger category normalization:

- `بالغ` -> `ADULT`
- `طفل` -> `CHILD`
- `طفل لحد 8 سنين`, `طفل ل 8 سنين`, `طفل حتى 8 سنوات` -> `CHILD_UNDER_8`
- `سيدة`, `السيدات` -> `LADIES`
- empty/unknown stays as raw note plus warning.

## 7. Frontend Implementation

### 7.1 Import page redesign

Replace the current transaction import UX with a manifest import workflow:

1. Upload area.
2. Parse/preview loading state.
3. Summary bar:
   - total rows
   - valid rows
   - rows with warnings/errors
   - detected agents count
4. Large editable table/canvas.
5. Save edits.
6. Export/Publish to Agent Data.

### 7.2 Editable table design

Because the sample has hundreds of rows and many columns, build a table component with:

- sticky header
- horizontal scroll
- row numbers
- inline editable cells
- validation badges
- per-column filters
- search by passenger name/passport/agent/flight
- agent filter
- destination filter
- departure date filter
- keyboard-friendly editing
- save dirty rows only

Suggested component:

- `frontend/src/pages/import/components/ManifestEditableGrid.jsx`

Recommended styling:

- white main surface
- subtle borders
- compact row height
- sticky toolbar
- clear primary publish button
- RTL-aware alignment when Arabic is active

No new heavy table library is required for the first version. A custom table with controlled inputs is enough for 500-2,000 rows. If later files become very large, add row virtualization.

### 7.3 Frontend API module

Create or extend:

- `frontend/src/api/manifestImport.api.js`

Functions:

- `previewManifestImport(file)`
- `getManifestRows(batchId, params)`
- `updateManifestRow(batchId, rowId, data)`
- `bulkUpdateManifestRows(batchId, rows)`
- `publishManifestImport(batchId)`
- `getAgentManifestSummary(params)`
- `getAgentManifestPassengers(agentId, params)`

### 7.4 Agent Data page upgrade

Update `AgentDataPage.jsx` to include:

- existing agent management table
- new manifest summary area
- clickable agent rows/cards
- agent details panel or route

Recommended UX:

- Left or top list: agents with passenger counts.
- Click agent: right-side drawer or below-table details section.
- Details table columns:
  - passenger name
  - birth date
  - national ID
  - passport number
  - departure port
  - destination
  - flight number
  - departure date
  - arrival time
  - service type
  - passenger category / notes

### 7.5 Dashboard integration

For the first milestone, publishing should make the data visible in Agent Data. Dashboard widgets can be added after that:

- today's uploaded manifests
- passenger count by agent
- passenger count by destination
- upcoming departures

## 8. English and Arabic Support

Use existing `react-i18next`.

Add translation keys for:

- import page title/subtitle
- upload actions
- preview states
- grid column names
- validation errors
- publish/export actions
- agent manifest summary
- agent passenger details

Fix Arabic translation file encoding if needed. The current Arabic JSON appears mojibake in terminal output, so verify the file is saved as UTF-8 and renders correctly in the browser.

RTL requirements:

- Keep `document.documentElement.dir = 'rtl'` for Arabic.
- Use logical Tailwind spacing where possible.
- Numeric identifiers like passport number, national ID, flight number, and dates should remain readable with `dir="ltr"` inside cells when needed.

## 9. Permissions

Add permissions if the app uses DB-seeded authorities:

- `MANIFEST_IMPORT_VIEW`
- `MANIFEST_IMPORT_CREATE`
- `MANIFEST_IMPORT_EDIT`
- `MANIFEST_IMPORT_PUBLISH`

Route access:

- `/import`: `MANIFEST_IMPORT_CREATE` or existing `TRANSACTION_CREATE` temporarily.
- Agent manifest details: `AGENT_VIEW`.

Prefer adding the new permissions through a Flyway migration and assigning them to admin roles.

## 10. Implementation Order

### Phase 1: Backend foundation

1. Add Flyway migration for manifest tables and permissions.
2. Add manifest entities, repositories, DTOs, mapper.
3. Implement Excel parser with the sample headers.
4. Implement preview endpoint.
5. Implement row update endpoint.
6. Implement publish endpoint.
7. Implement agent summary and agent passenger endpoints.

### Phase 2: Frontend import workflow

1. Add `manifestImport.api.js`.
2. Redesign `ImportDataPage.jsx`.
3. Add upload/preview states.
4. Add editable manifest grid.
5. Add validation display and dirty-row save.
6. Add publish/export button.

### Phase 3: Agent Data integration

1. Add manifest summary fetch to agents API.
2. Extend Agent Data page with passenger counts.
3. Add click-to-view agent passenger details.
4. Add filters for departure date, destination, port, and flight.

### Phase 4: i18n and polish

1. Add English translations.
2. Add Arabic translations.
3. Verify RTL layout.
4. Polish table responsiveness and empty/error states.

### Phase 5: Tests and verification

1. Backend parser unit test using the provided workbook shape.
2. Backend publish integration test.
3. Backend agent passenger endpoint test.
4. Frontend build check.
5. Manual browser test:
   - upload file
   - preview rows
   - edit cells
   - publish
   - open Agent Data
   - click agent
   - verify passengers appear correctly

## 11. Edge Cases

- Duplicate agent names with different spelling.
- Missing passport numbers.
- Repeated `ملاحظات` headers.
- Excel numeric national IDs losing leading zeros.
- Arabic date text vs Excel date cells.
- Empty trailing columns.
- Rows with only financial columns filled.
- Same passenger imported in multiple daily files.
- Re-uploading the same file by mistake.

Recommended duplicate strategy for first version:

- Allow duplicates across batches.
- Warn when the same `passportNumber + departureDate + flightNumber` already exists.
- Add a later option to skip duplicates or update existing rows.

## 12. Acceptance Criteria

The feature is complete when:

- A sample Arabic Excel manifest uploads successfully.
- All important columns appear in the preview grid.
- The user can edit imported rows before publishing.
- Duplicate `ملاحظات` columns are preserved and mapped correctly.
- Agents from the Excel file appear in Agent Data.
- Clicking an agent shows only that agent's passengers.
- Passenger details include port, destination, flight number, departure date, arrival time, service type, and notes.
- UI works in English and Arabic.
- Arabic layout is RTL and readable.
- Backend tests pass.
- Frontend build passes.

## 13. Future Enhancements

- Export filtered agent passenger lists back to Excel/PDF.
- Add import history page.
- Add undo publish/cancel batch.
- Add bulk edit by selected rows.
- Add pricing/service calculations from price lists.
- Add role-based approval before publishing.
- Add row virtualization for very large daily files.
