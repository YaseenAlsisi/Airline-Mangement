# Dynamic Price List Module — Implementation Plan

## 1. Objective

Refactor the existing Price List module into a clean, production-ready, fully user-driven pricing builder.

The reference spreadsheet/image is only a business reference. **Do not copy, seed, hard-code, or assume any airport names, destination names, prices, commissions, or route data from it.**

A newly created Price List must start effectively blank. The user builds every pricing group manually.

The only predefined business choices inside a pricing group are the passenger types:

- `ADULT` — Adult / بالغ
- `CHILD_UNDER_8` — Child up to 8 years / طفل حتى 8 سنوات
- `LADIES` — Ladies / سيدات
- `INFANT` — Infant / رضيع

Everything else described below is entered by the user for that Price List.

---

## 2. Core Business Rule

A Price List contains one or more **Pricing Groups**.

Each Pricing Group represents one user-defined route/context and contains:

- Departure Airport / Port — free-form user-entered text
- Destination / Departure Direction — free-form user-entered text
- One or more passenger pricing rows

Each passenger pricing row contains:

- Passenger Type — predefined dropdown
- Price — manually entered
- Commission — manually entered
- Currency — use the application's existing currency behavior if one exists; otherwise provide a sensible configurable/selectable field without hard-coding business data

Conceptually:

```text
Price List
│
├── Pricing Group 1
│   ├── Departure Airport: [user enters value]
│   ├── Destination:       [user enters value]
│   │
│   ├── Adult          → Price + Commission
│   ├── Child up to 8  → Price + Commission
│   ├── Ladies         → Price + Commission
│   └── Infant         → Price + Commission
│
├── Pricing Group 2
│   ├── Departure Airport: [user enters value]
│   ├── Destination:       [user enters value]
│   └── Passenger Pricing...
│
└── Pricing Group N
```

The user can add as many Pricing Groups as needed.

---

## 3. Critical Non-Negotiable Requirements

### 3.1 No airport master data

Do **not** create:

- Airport enum
- Airport master table
- Airport settings page
- Seeded airport records
- Hard-coded airport dropdown options

The Departure Airport/Port value belongs to the Pricing Group and is entered manually by the user.

### 3.2 No destination master data

Do **not** create:

- Destination enum
- Destination master table
- Destination settings page
- Seeded destinations
- Hard-coded destination dropdown options

The Destination value belongs to the Pricing Group and is entered manually by the user.

### 3.3 Do not copy spreadsheet values

Do not seed values such as Cairo, Borg El Arab, Benghazi, Tripoli, Misrata, Sabha, or any prices shown in the reference image.

Those values are examples of real-world data only.

### 3.4 Passenger Type is predefined

Passenger Type is the exception.

Use a dropdown with exactly these initial options:

```text
ADULT
CHILD_UNDER_8
LADIES
INFANT
```

Display labels must be localized through i18n.

Do not make the user type passenger type names manually.

### 3.5 Price and Commission are manual

Never infer prices or commissions from the reference image.

Every Price and Commission value is entered manually by the user for the selected passenger type in the current Pricing Group.

---

## 4. First Step: Inspect the Existing Repository

Before modifying code, inspect the current implementation and dependencies.

At minimum inspect:

```text
backend/src/main/java/com/ldi/aams/pricelist/
backend/src/main/resources/db/migration/
frontend/src/pages/price-lists/
frontend/src/api/priceLists.api.js
frontend/src/locales/ar/
frontend/src/locales/en/
```

Also inspect all consumers of Price List data, especially:

- Transaction module
- Transaction calculation/service layer
- Excel/import functionality
- Reports
- Dashboard calculations
- Any commission calculation
- Any pricing lookup

Search the whole repository for:

```text
PriceList
PriceListEntry
commissionPercentage
markupAmount
commission
departure
destination
passengerType
baseFare
```

Do not start by blindly rewriting files.

Understand the current data flow first.

---

## 5. Preserve the Existing Technology Stack

Use the project's existing stack and conventions.

Expected stack includes:

### Backend

- Spring Boot
- Spring Data JPA
- PostgreSQL / Neon
- Flyway
- Existing DTO/service/controller patterns
- Existing exception handling
- Existing RBAC/security

### Frontend

- React
- Vite
- Tailwind CSS
- Existing Axios API client
- Existing i18next setup
- Existing component/design conventions

Do not introduce another framework or duplicate infrastructure unnecessarily.

---

## 6. Recommended Domain Model

Keep the Price List as the aggregate root.

Recommended conceptual model:

```text
PriceList
    └── PricingGroup[]
            └── PricingEntry[]
```

A normalized database model is preferred because a Pricing Group owns route/context data once and passenger rows live underneath it.

### PriceList

Recommended fields, adapted to the existing entity rather than blindly replacing it:

```text
id
code
name
status
validFrom
validTo
airlineId (if currently required by the business)
agentId   (if currently required by the business)
createdAt
updatedAt
```

### PricingGroup

```text
id
priceListId
departureAirport
destination
createdAt
updatedAt
```

`departureAirport` and `destination` are plain user-entered strings.

They are NOT foreign keys to master-data tables.

### PricingEntry

```text
id
pricingGroupId
passengerType
price
commission
currency
createdAt
updatedAt
```

Use `BigDecimal` for monetary values.

Never use `float` or `double` for money.

---

## 7. Database Migration Strategy

Inspect existing Flyway migration versions first.

Never edit an already-applied Flyway migration.

Create a new versioned migration using the next available version.

The migration must preserve existing production data wherever reasonably possible.

If the current schema stores route information directly on every `price_list_entries` row, migrate toward the Pricing Group structure safely.

Possible target tables:

```text
price_lists
price_list_groups
price_list_entries
```

Example relationship:

```text
price_lists
    1
    |
    N
price_list_groups
    1
    |
    N
price_list_entries
```

### Constraints

A group must require:

```text
price_list_id
non-empty departure_airport
non-empty destination
```

An entry must require:

```text
pricing_group_id
passenger_type
price
commission
```

Prevent the same passenger type from appearing twice in the same Pricing Group.

Recommended unique constraint:

```text
UNIQUE(pricing_group_id, passenger_type)
```

Do not create a database enum or reference table for Airport or Destination.

Passenger Type may be persisted as a string enum.

---

## 8. Passenger Type Enum

Create/reuse a backend enum similar to:

```java
public enum PassengerType {
    ADULT,
    CHILD_UNDER_8,
    LADIES,
    INFANT
}
```

Persist enum names as strings, not ordinals.

The enum is a stable internal identifier only.

User-visible labels come from frontend translations.

---

## 9. Backend Entity Design

### PricingGroup entity

Conceptually:

```java
private UUID id;
private PriceList priceList;
private String departureAirport;
private String destination;
private List<PriceListEntry> entries;
private Instant createdAt;
private Instant updatedAt;
```

### PriceListEntry entity

Conceptually:

```java
private UUID id;
private PricingGroup pricingGroup;
private PassengerType passengerType;
private BigDecimal price;
private BigDecimal commission;
private String currency;
private Instant createdAt;
private Instant updatedAt;
```

Use the project's existing auditing approach if one already exists.

---

## 10. Backend Validation

### Pricing Group

Validate:

```text
departureAirport != null
departureAirport.trim() is not empty

destination != null
destination.trim() is not empty
```

Apply reasonable maximum lengths.

Trim leading/trailing whitespace before persistence.

Do not silently replace the user's text with predefined values.

### Pricing Entry

Validate:

```text
passengerType != null
price != null
commission != null
price >= 0
commission >= 0
currency valid according to current application rules
```

Prevent duplicate passenger types inside one group.

### Price List

Validate existing required metadata and:

```text
validFrom <= validTo
```

when both dates are present.

---

## 11. Duplicate Rules

Inside the same Pricing Group, this must be invalid:

```text
Adult
Adult
```

A group can have at most one row for each predefined passenger type.

Therefore the practical maximum is currently four passenger rows per Pricing Group.

Different groups may use the same passenger types normally.

For route/group duplicates, inspect the business behavior before enforcing a hard database uniqueness rule on free-form text.

At minimum, frontend/backend should warn or prevent obvious exact duplicates after trimming/case normalization if they would create ambiguous pricing.

Do not over-normalize Arabic or user-entered names destructively.

---

## 12. API Contract

Prefer a nested API contract because it mirrors what the user edits.

Example create/update request:

```json
{
  "code": "PL-2026-001",
  "name": "June Price List",
  "status": "ACTIVE",
  "validFrom": "2026-06-01",
  "validTo": "2026-06-30",
  "airlineId": null,
  "agentId": null,
  "groups": [
    {
      "departureAirport": "User entered value",
      "destination": "User entered value",
      "entries": [
        {
          "passengerType": "ADULT",
          "price": 0,
          "commission": 0,
          "currency": "EGP"
        }
      ]
    }
  ]
}
```

The `0` values above demonstrate the schema only. They are not default business prices.

Do not prepopulate actual prices or commissions.

If changing the API to nested groups would break too many existing consumers, preserve backward compatibility at the mapper/service layer, but the domain behavior and frontend UX must still follow the Pricing Group model.

---

## 13. Price List CRUD

Preserve or cleanly adapt the existing endpoints:

```text
GET    /api/v1/price-lists
GET    /api/v1/price-lists/{id}
POST   /api/v1/price-lists
PUT    /api/v1/price-lists/{id}
```

If delete/archive already exists, preserve its current business behavior.

Keep existing permissions such as:

```text
PRICE_VIEW
PRICE_CREATE
PRICE_EDIT
```

Do not bypass RBAC.

---

## 14. Backend Save Behavior

When creating/updating a Price List:

1. Validate Price List metadata.
2. Validate every Pricing Group.
3. Trim free-form route fields.
4. Validate every passenger row.
5. Detect duplicate passenger types per group.
6. Persist the Price List.
7. Persist groups as children.
8. Persist pricing entries as children of groups.
9. Correctly handle removed groups/entries during update using the project's JPA conventions.
10. Return the complete saved structure.

Use a transaction boundary for aggregate create/update operations.

---

## 15. Existing Commission Logic

Inspect the current use of fields such as:

```text
commissionPercentage
markupAmount
```

The requested model uses a manually entered commission value on each passenger pricing row.

Do not leave a hidden global commission calculation active if it conflicts with the new row-level commission.

However, do not delete legacy fields blindly.

Migration strategy:

1. Find all consumers.
2. Determine whether they are still required elsewhere.
3. Introduce row-level commission as the Price List source of truth.
4. Update dependent calculations safely.
5. Deprecate obsolete global fields.
6. Remove them only when no required consumer remains and a safe migration exists.

---

## 16. Pricing Resolution / Transaction Integration

The Price List must eventually be usable by the real transaction workflow, not only displayed in the UI.

Inspect how a transaction identifies the applicable pricing context.

Do not invent transaction fields without checking existing domain semantics.

If transactions already contain equivalent route/passenger information, reuse it.

A pricing resolution should conceptually resolve:

```text
Applicable Price List
        ↓
Matching Pricing Group
        ↓
Matching Passenger Type
        ↓
Price + Commission
```

Because Departure Airport and Destination are free-form values, do not build fragile lookup behavior without inspecting how those values enter transactions.

If automatic matching cannot be made reliable with the existing transaction data, keep Price List CRUD correct first and clearly isolate the integration point rather than inventing unsafe matching rules.

---

## 17. Frontend UX Goal

Replace the current broken/copy-paste spreadsheet experience with a clean Pricing Builder.

The UI should feel like a modern management system, not an Excel clone.

It must support both Arabic and English and work correctly in RTL and LTR.

---

## 18. Price List Page

Suggested page header:

Arabic:

```text
قوائم الأسعار
إدارة قوائم الأسعار والعمولات
```

English:

```text
Price Lists
Manage pricing and commissions
```

Primary action:

```text
+ Add Price List
```

localized in Arabic/English.

Display saved Price Lists using clean cards/table sections consistent with the rest of the application.

---

## 19. Add Price List Experience

When the user clicks **Add Price List**, open a wide modal, drawer, or dedicated page consistent with the existing application UX.

The new Price List must not contain business data copied from the reference image.

### Basic Information

Use existing relevant metadata, for example:

```text
Name
Code
Status
Valid From
Valid To
Airline (only if part of existing model)
Agent   (only if part of existing model)
```

Then show the Pricing Groups builder.

---

## 20. Blank Initial State

The Pricing Builder should start blank or with one empty structural group only.

Example:

```text
Pricing Groups

No pricing groups added yet.

[ + Add Pricing Group ]
```

Alternatively, create one empty group shell for convenience, but it must contain no seeded airport, destination, price, or commission values.

---

## 21. Pricing Group UI

Each Pricing Group should look conceptually like:

```text
┌──────────────────────────────────────────────────────┐
│ Pricing Group #1                            [Remove] │
│                                                      │
│ Departure Airport / Port                             │
│ [ Type the departure airport or port...           ] │
│                                                      │
│ Destination                                          │
│ [ Type the destination...                          ] │
│                                                      │
│ Passenger Pricing                                    │
│                                                      │
│ Passenger Type       Price     Commission   Currency │
│ [ Select ▼ ]         [     ]   [        ]   [      ] │
│                                                      │
│ [ + Add Passenger Type ]                             │
└──────────────────────────────────────────────────────┘
```

Important:

- Departure Airport/Port is a text input, not a predefined dropdown.
- Destination is a text input, not a predefined dropdown.
- Passenger Type is a predefined dropdown.
- Price is manual.
- Commission is manual.

---

## 22. Passenger Type Dropdown

Dropdown options:

### English

```text
Adult
Child up to 8 years
Ladies
Infant
```

### Arabic

```text
بالغ
طفل حتى 8 سنوات
سيدات
رضيع
```

Internally submit:

```text
ADULT
CHILD_UNDER_8
LADIES
INFANT
```

Once a passenger type is selected in a group, remove/disable it from that group's remaining dropdown choices to prevent duplicates.

---

## 23. Add Passenger Type Behavior

Button:

```text
+ Add Passenger Type
```

Localized Arabic equivalent must also exist.

On click, add an empty pricing row:

```text
Passenger Type: unselected
Price: empty
Commission: empty
Currency: application's sensible default/selection behavior
```

Do not automatically fill price or commission.

Optionally provide:

```text
Add All Passenger Types
```

If implemented, it should create the four passenger types with **empty price and commission fields**.

Never seed financial values.

---

## 24. Add Pricing Group Behavior

Button:

```text
+ Add Pricing Group
```

Each click adds a new blank group.

The user can therefore manually create any structure, for example:

```text
Group 1
Departure: [whatever the user types]
Destination: [whatever the user types]

Group 2
Departure: [different user value]
Destination: [different user value]

Group 3
...
```

There must be no schema/code change required to add more groups.

---

## 25. Frontend State Shape

Recommended form state:

```javascript
{
  code: "",
  name: "",
  status: "ACTIVE",
  validFrom: "",
  validTo: "",
  airlineId: null,
  agentId: null,

  groups: [
    {
      clientId: crypto.randomUUID(),
      departureAirport: "",
      destination: "",
      entries: [
        {
          clientId: crypto.randomUUID(),
          passengerType: "",
          price: "",
          commission: "",
          currency: "EGP"
        }
      ]
    }
  ]
}
```

The exact currency default must follow existing project/business behavior. Do not infer currencies from the reference image.

Use stable client IDs for unsaved rows/groups.

Do not use `Math.random()` for React keys.

---

## 26. Frontend Validation

Before submit, validate:

### Group

- Departure Airport/Port is required.
- Destination is required.

### Entry

- Passenger Type is required.
- Price is required.
- Price must be numeric and `>= 0`.
- Commission is required.
- Commission must be numeric and `>= 0`.
- Passenger Type must not be duplicated inside the same group.

Display inline validation close to the invalid field.

Backend validation remains authoritative.

---

## 27. Edit Existing Price List

Editing must reconstruct the saved nested structure correctly.

The user must be able to:

- Edit Departure Airport/Port text
- Edit Destination text
- Change a passenger type if valid
- Change price
- Change commission
- Change currency if supported
- Add passenger rows
- Remove passenger rows
- Add groups
- Remove groups

Never replace user-entered route text with hard-coded labels during edit.

---

## 28. Price List Display

Saved data can be rendered as grouped cards.

Example structure only:

```text
┌─────────────────────────────────────────────────────┐
│ Price List Name                             ACTIVE │
│                                                     │
│ [User Departure] → [User Destination]              │
│                                                     │
│ Type               Price       Commission          │
│ Adult              ...         ...                 │
│ Child up to 8      ...         ...                 │
│ Ladies             ...         ...                 │
│ Infant             ...         ...                 │
│                                                     │
│ [Edit]                                              │
└─────────────────────────────────────────────────────┘
```

Do not show placeholder/example prices in production UI.

---

## 29. Arabic and English i18n

This is mandatory.

The entire new Price List UI must support both languages using the existing i18next architecture.

Update both:

```text
frontend/src/locales/ar/translation.json
frontend/src/locales/en/translation.json
```

Do not hard-code visible Arabic or English strings directly in JSX where translations should be used.

Recommended keys include:

```text
priceList.title
priceList.subtitle
priceList.add
priceList.edit
priceList.save
priceList.cancel
priceList.name
priceList.code
priceList.status
priceList.validFrom
priceList.validTo
priceList.pricingGroups
priceList.pricingGroup
priceList.addPricingGroup
priceList.removePricingGroup
priceList.departureAirport
priceList.departureAirportPlaceholder
priceList.destination
priceList.destinationPlaceholder
priceList.passengerPricing
priceList.passengerType
priceList.addPassengerType
priceList.addAllPassengerTypes
priceList.removePassengerType
priceList.price
priceList.commission
priceList.currency
priceList.empty.title
priceList.empty.description
priceList.validation.required
priceList.validation.invalidPrice
priceList.validation.invalidCommission
priceList.validation.duplicatePassengerType
```

Passenger labels:

```text
passengerType.adult
passengerType.childUnder8
passengerType.ladies
passengerType.infant
```

### English labels

```text
Adult
Child up to 8 years
Ladies
Infant
```

### Arabic labels

```text
بالغ
طفل حتى 8 سنوات
سيدات
رضيع
```

Ensure RTL layout is correct in Arabic and LTR layout is correct in English.

---

## 30. API Client

Continue using the existing API infrastructure, especially the project's existing Axios client.

Update:

```text
frontend/src/api/priceLists.api.js
```

Do not create a second Axios instance unless the repository architecture explicitly requires one.

---

## 31. Suggested Frontend Components

Refactor only as much as necessary.

Possible structure:

```text
frontend/src/pages/price-lists/
├── PriceListDataPage.jsx
├── PriceListFormModal.jsx
└── components/
    ├── PriceListCard.jsx
    ├── PricingGroupEditor.jsx
    ├── PassengerPricingRow.jsx
    └── PassengerTypeSelect.jsx
```

Names may be adapted to existing conventions.

Avoid unnecessary over-componentization.

---

## 32. Loading, Empty, Error, and Save States

### Loading

Use the application's existing loading/skeleton pattern.

### Empty

Arabic and English localized empty state.

Do not fake spreadsheet rows.

### Save

On submit:

1. Validate client-side.
2. Disable duplicate submissions.
3. Show saving state.
4. POST/PUT.
5. Keep the form open if the request fails.
6. Preserve entered values after failure.
7. Display readable API errors.
8. Close/refetch/show success feedback after successful save.

Do not rely only on `console.error()`.

---

## 33. Responsive UI

Desktop:

- Use the available width well.
- Pricing Groups should be easy to scan.
- Financial inputs should align clearly.

Tablet/mobile:

- Stack group fields appropriately.
- Passenger rows may become stacked cards instead of forcing a wide spreadsheet.
- Buttons must remain easy to use.

Do not recreate the reference spreadsheet's dense layout on mobile.

---

## 34. Accessibility

Implement:

- Proper labels
- Keyboard navigation
- Visible focus states
- Accessible modal/dialog behavior
- `aria-label` for icon-only controls
- Clear required/error states
- Disabled state while saving

Delete/remove actions must have accessible names.

---

## 35. Permissions

Preserve the existing Price List permission model.

Expected behavior:

```text
PRICE_VIEW   → access/view
PRICE_CREATE → Add Price List
PRICE_EDIT   → edit existing Price List
```

If the actual repository uses different permission names, follow the repository rather than inventing new ones.

---

## 36. Error Handling

Use the project's existing exception/error architecture.

Possible business error codes:

```text
PRICE_LIST_CODE_EXISTS
INVALID_PRICE_LIST_DATES
EMPTY_PRICING_GROUP
INVALID_DEPARTURE_AIRPORT
INVALID_DESTINATION
DUPLICATE_PASSENGER_TYPE
INVALID_PRICE
INVALID_COMMISSION
PRICE_LIST_NOT_FOUND
PRICING_GROUP_NOT_FOUND
PRICE_ENTRY_NOT_FOUND
```

`INVALID_DEPARTURE_AIRPORT` here means blank/invalid text according to validation rules; it does **not** mean the value failed to match a predefined airport list.

Same rule applies to Destination.

---

## 37. Backend Tests

Add/update tests for at least:

### Create blank-to-user-defined structure

Create a Price List where all route names and financial values come from the request.

Verify no seeded route data appears.

### Multiple groups

Create several Pricing Groups with arbitrary user-entered Departure/Destination values.

Verify they remain independent.

### Passenger types

Verify all four enum types can be stored.

### Duplicate passenger type

Two `ADULT` entries in the same group must fail.

### Same passenger type in different groups

Must succeed.

### Money validation

Reject:

```text
price < 0
commission < 0
```

### Text validation

Reject blank/whitespace-only Departure or Destination.

Preserve valid user-entered Arabic and English text.

### Update

Test:

- Rename Departure text
- Rename Destination text
- Add group
- Remove group
- Add passenger type
- Remove passenger type
- Change price
- Change commission

---

## 38. Frontend Verification Scenarios

### Scenario 1 — New Price List

Click Add Price List.

Verify there are no spreadsheet-derived airports, destinations, prices, or commissions.

### Scenario 2 — User-defined group

Add a Pricing Group.

Type any Departure value.

Type any Destination value.

Save passenger pricing.

Verify the exact user-entered values survive refresh.

### Scenario 3 — Passenger dropdown

Verify the dropdown contains:

```text
Adult
Child up to 8 years
Ladies
Infant
```

and Arabic equivalents when Arabic is active.

### Scenario 4 — Multiple groups

Add multiple completely different groups.

Verify each group saves independently.

### Scenario 5 — Duplicate passenger

Select Adult twice in the same group.

Frontend must block it.

Backend must also reject it if frontend validation is bypassed.

### Scenario 6 — Arabic

Switch to Arabic.

Verify:

- Arabic labels
- RTL
- passenger translations
- inputs remain usable
- user-entered Arabic route names are preserved

### Scenario 7 — English

Switch to English.

Verify LTR and English labels.

---

## 39. Production/Data Safety

Before modifying schema:

1. Inspect Flyway history.
2. Inspect current production Price List records.
3. Determine how existing entries should migrate.
4. Create a new migration.
5. Never rewrite applied migrations.
6. Never automatically delete unknown existing data.
7. Never use `ddl-auto=create` or `create-drop`.
8. Preserve the project's production-safe Hibernate/Flyway configuration.

If legacy data cannot be mapped safely, document/report it rather than silently discarding it.

---

## 40. Secret Safety

Do not copy database passwords, JWT secrets, connection strings, or other credentials into:

- frontend code
- documentation
- logs
- migration comments
- examples

If secrets are currently committed in configuration files, do not propagate them further. Prefer the project's environment-variable configuration pattern or improve it safely if this task includes configuration cleanup.

---

## 41. Remove Broken/Fake UI Behavior

Remove Price List UI behavior that exists only to imitate the spreadsheet or uses fake copied data.

The reference image defines the **business idea**, not the UI implementation and not the initial dataset.

The page must render only actual saved backend data.

Also remove unstable React patterns such as:

```javascript
key={entry.id || Math.random()}
```

Use backend IDs for persisted records and stable client IDs such as `crypto.randomUUID()` for unsaved records.

---

## 42. Implementation Order

### Phase 0 — Repository Analysis

Inspect current Price List, transaction, import, database, security, frontend, and i18n implementation.

### Phase 1 — Finalize Domain Mapping

Map the existing schema to:

```text
PriceList
→ PricingGroup
→ PricingEntry
```

without creating Airport/Destination master data.

### Phase 2 — Database Migration

Create a new safe Flyway migration.

### Phase 3 — Backend Domain

Implement/refactor:

- entities
- PassengerType enum
- repositories
- DTOs
- mapper

### Phase 4 — Backend Service

Implement:

- nested create/update
- validation
- duplicate prevention
- transactional persistence

### Phase 5 — Controller/API

Update request/response contracts while preserving security and existing endpoint conventions.

### Phase 6 — Existing Pricing Consumers

Safely update commission/pricing consumers only after understanding current semantics.

### Phase 7 — Frontend API

Update API serialization/deserialization.

### Phase 8 — Pricing Builder UI

Implement:

- blank Price List state
- Add Pricing Group
- free-form Departure input
- free-form Destination input
- passenger dropdown
- manual Price
- manual Commission
- add/remove rows
- add/remove groups

### Phase 9 — Edit Experience

Load saved nested data and allow full editing.

### Phase 10 — Arabic/English

Complete i18n keys and RTL/LTR verification.

### Phase 11 — Testing and Build

Run backend tests and frontend lint/build.

---

## 43. Acceptance Criteria

- [ ] A new Price List contains no seeded airport data.
- [ ] A new Price List contains no seeded destination data.
- [ ] A new Price List contains no copied spreadsheet prices.
- [ ] A new Price List contains no copied spreadsheet commissions.
- [ ] User can add unlimited Pricing Groups.
- [ ] User manually enters Departure Airport/Port text per group.
- [ ] User manually enters Destination text per group.
- [ ] No Airport master table/enum/dropdown is introduced.
- [ ] No Destination master table/enum/dropdown is introduced.
- [ ] Passenger Type is a dropdown.
- [ ] Passenger Type includes Adult.
- [ ] Passenger Type includes Child up to 8 years.
- [ ] Passenger Type includes Ladies.
- [ ] Passenger Type includes Infant.
- [ ] Passenger Type values use stable internal codes.
- [ ] User manually enters Price.
- [ ] User manually enters Commission.
- [ ] Duplicate passenger type inside one group is blocked.
- [ ] Negative Price is blocked.
- [ ] Negative Commission is blocked.
- [ ] Saved user-entered route text survives refresh unchanged except safe trimming.
- [ ] User can edit groups.
- [ ] User can remove groups.
- [ ] User can add/remove passenger rows.
- [ ] Arabic UI is fully supported.
- [ ] English UI is fully supported.
- [ ] Arabic uses correct RTL behavior.
- [ ] English uses correct LTR behavior.
- [ ] Existing RBAC remains enforced.
- [ ] Backend remains the source of truth.
- [ ] Flyway migration is production-safe.
- [ ] No applied migration is edited.
- [ ] Existing dependent modules are inspected before changing pricing semantics.
- [ ] Backend tests pass.
- [ ] Frontend build passes.
- [ ] Frontend lint passes.

---

## 44. Final Expected Workflow

```text
Add Price List
      ↓
Enter Price List metadata
      ↓
Add Pricing Group
      ↓
Type Departure Airport / Port manually
      ↓
Type Destination manually
      ↓
Add Passenger Pricing Row
      ↓
Select Passenger Type from dropdown
      ↓
Enter Price manually
      ↓
Enter Commission manually
      ↓
Add more Passenger Types if needed
      ↓
Add another Pricing Group if needed
      ↓
Save
      ↓
Backend validates
      ↓
Database persists exact user-defined structure
```

The Price List is a **blank pricing structure builder**.

The application provides the structure and validation.

The user provides the route/context names, prices, and commissions.

The only predefined route-level business selection required by this specification is the Passenger Type dropdown.

---

## 45. Agent Guardrails

1. Do not use the reference spreadsheet as seed data.
2. Do not hard-code Airport names.
3. Do not hard-code Destination names.
4. Do not create Airport master data.
5. Do not create Destination master data.
6. Do not create unnecessary settings screens for these fields.
7. Keep Passenger Type as the predefined dropdown described above.
8. Do not prefill Price or Commission with business values.
9. Do not rewrite the whole application.
10. Do not replace the existing stack.
11. Do not bypass RBAC.
12. Do not edit applied Flyway migrations.
13. Do not delete legacy data silently.
14. Do not expose secrets.
15. Do not use translated display labels as backend identifiers for Passenger Type.
16. Do not hard-code visible UI strings; use Arabic/English i18n.
17. Preserve user-entered Arabic and English route text.
18. Keep backend validation authoritative.
19. Inspect all pricing/commission consumers before changing financial calculations.
20. Run tests/build/lint before considering the implementation complete.

---

## 46. Definition of Done

The module is complete when the user can open a completely fresh Price List, build arbitrary Pricing Groups from zero, manually type the Departure and Destination for every group, select passenger categories from the predefined dropdown, manually enter Price and Commission for each category, save everything reliably to the backend/database, edit it later, and use the feature in both Arabic and English without any spreadsheet-derived business data being hard-coded into the application.
