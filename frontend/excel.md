I have an Excel workbook containing airline agent accounts, and I need you to understand its structure very thoroughly and build tools around it (importing + calculations) so I can work with this data normally.

## Workbook Structure (Attached File)

The workbook contains more than 88 sheets, organized as follows:

### 1) "الرئيسيه" Sheet (Main Summary Sheet)

* Column A: Serial number (م)
* Column B: Agent name — contains a hyperlink that points to that agent's own sheet.
* Column C: Formula that retrieves the agent's total debt in USD from a specific cell in the agent's sheet (such as J706).
* Column D: Formula that retrieves the agent's total debt in EGP from another cell in the agent's sheet (such as J707).
* Column E: `D ÷ fixed number` (approximately the ticket price, e.g. 45,200). This gives an approximate number of tickets the agent is indebted for.

There is also another section in the same sheet called "مديونيات معدومة", using the same columns for agents classified separately as bad/uncollectible debts.

### 2) Individual Agent Sheets

There are approximately 88 agent sheets, one for each agent.

Every agent sheet always has the same 20 columns, in exactly this order:

A: Name
B: Date of Birth
C: National ID
D: Passport Number
E: Airport / Departure Point
F: Destination
G: Airline
H: Departure Date
I: Departure Time
J: Agent
K: Investment Supplier
L: Notes
M: Service Type
N, O, P: Additional Notes
Q: Debit USD
R: Credit USD
S: Debit EGP
T: Credit EGP

### Important Data Rules Inside Agent Sheets

* The first row after the header may contain "ما قبله" (opening balance / previous balance). It may contain only a value in Column A and amounts in Q/R/S/T, without any passenger information.
* You may find rows such as "إيداع بنكي بتاريخ ... باسم فلان" (bank deposit on a certain date in the name of someone), where only Column A and Column T (Credit EGP) are populated. This represents a payment/settlement recorded as a standalone transaction, not an actual passenger. The importer must identify these rows and separate them from actual passenger records.
* At the end of each sheet, there are two summary rows:

  * "اجمالي المديونيه دولار" = `SUM(Q:Q) - SUM(R:R)`
  * "اجمالي المديونيه مصري" = `SUM(S:S) - SUM(T:T)`
* After these totals, there is a cell labeled "الرئيسيه", which is a link back to the main summary sheet.
* Some sheets contain additional empty columns after T for formatting purposes only. Ignore them because they do not contain actual data.

## Exact Requirements

### 1) Build an Excel Parser / Importer

Read the attached workbook and build a parser/importer that correctly distinguishes between:

* A real passenger row — contains a passenger name and complete travel-related information.
* An opening balance row — "ما قبله".
* A payment/settlement row — such as "إيداع بنكي" or any other description in Column A without the rest of the passenger information.
* Total and navigation rows — ignore these during import because they are outputs, not input transactions.

### 2) Calculate Agent Balances

For every agent, calculate:

* Total debt in USD = `SUM(Debit USD) - SUM(Credit USD)`
* Total debt in EGP = `SUM(Debit EGP) - SUM(Credit EGP)`
* Approximate number of tickets = `Total EGP Debt ÷ user-defined ticket price`

The ticket price must be entered by the user at runtime. It must NOT be hardcoded into the application.

### 3) Main Summary Report

Create a UI/report that follows the same structure as the "الرئيسيه" sheet:

* Column A: م (Serial Number)
* Column B: Agent Name
* Column C: Total Debt $
* Column D: Total Debt EGP
* Column E: Ticket-equivalent calculation

Include a grand total at the bottom.

### 4) Post-Import Operations

After importing the workbook, I should be able to:

* Add new passengers/transactions for any agent using the same 20 fields.
* Record a payment/settlement for a specific agent, with the agent's debt updating automatically.
* View an individual agent's full details:

  * All passenger/travel transactions
  * All payments/settlements
  * Current balance
* Export the balance report at any time using the same format as the "الرئيسيه" sheet, with the same columns and order.

### 5) Single Source of Truth for Accounting

This is extremely important:

The `Debit - Credit` calculation must be performed exactly once from one unified source of truth.

A payment/settlement must NOT be stored in multiple places and accidentally included twice in the balance calculation.

The system architecture should ensure that every financial transaction has one canonical record and that the agent's balance is always derived from that single source.

## Initial Step — Validate Your Understanding First

Before continuing with the full implementation:

**Start by reading the attached Excel workbook and provide me with a summary of the first 3 agent sheets as a sample.**

Use those 3 sheets to demonstrate that you correctly understand the workbook structure, identify the different types of rows, and understand how the debit/credit calculations work.

Do NOT proceed with the full implementation until the structure has been validated against those first 3 agent sheets.
