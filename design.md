## API Spec

### 1) GET /api/trips
- Purpose: List trips, optionally filtered by status.
- Query params:
  - `status` (string, optional; one of `planned`, `in-progress`, `completed`)
- Request body: none
- Success response:
  - HTTP 200
  - JSON array of trip objects:
    - `id: number`
    - `title: string`
    - `origin: string`
    - `destination: string`
    - `startDate: string` (ISO date, `YYYY-MM-DD`)
    - `endDate: string` (ISO date, `YYYY-MM-DD`)
    - `stops: string[]`
    - `budgetUsd: number`
    - `status: string`
    - `notes: string`
    - `createdAt: string` (ISO timestamp)
    - `updatedAt: string` (ISO timestamp)
- Error responses:
  - HTTP 400 when `status` is provided but not valid
  - HTTP 500 on unexpected server error

### 2) GET /api/trips/upcoming
- Purpose: List planned trips with start dates today or later.
- Request body: none
- Success response:
  - HTTP 200
  - JSON array of trip objects with same shape as `GET /api/trips`
- Error responses:
  - HTTP 500 on unexpected server error

### 3) GET /api/trips/{id}
- Purpose: Fetch details for one trip.
- Path params:
  - `id` (number, required)
- Request body: none
- Success response:
  - HTTP 200
  - JSON trip object with fields:
    - `id: number`
    - `title: string`
    - `origin: string`
    - `destination: string`
    - `startDate: string`
    - `endDate: string`
    - `stops: string[]`
    - `budgetUsd: number`
    - `status: string`
    - `notes: string`
    - `createdAt: string`
    - `updatedAt: string`
- Error responses:
  - HTTP 400 if `id` is not a valid integer
  - HTTP 404 if trip is not found
  - HTTP 500 on unexpected server error

### 4) POST /api/trips
- Purpose: Create a trip.
- Request body (JSON):
  - `title: string` (required)
  - `origin: string` (required)
  - `destination: string` (required)
  - `startDate: string` (required, ISO date)
  - `endDate: string` (required, ISO date)
  - `stops: string[]` (optional, default `[]`)
  - `budgetUsd: number` (required, `>= 0`)
  - `status: string` (optional, default `planned`)
  - `notes: string` (optional, default `""`)
- Success response:
  - HTTP 201
  - JSON created trip object with all fields from `GET /api/trips/{id}`
- Error responses:
  - HTTP 400 when required fields are missing, date range is invalid, or budget is negative
  - HTTP 500 on unexpected server error

### 5) PUT /api/trips/{id}
- Purpose: Update an existing trip.
- Path params:
  - `id` (number, required)
- Request body (JSON):
  - `title: string` (required)
  - `origin: string` (required)
  - `destination: string` (required)
  - `startDate: string` (required, ISO date)
  - `endDate: string` (required, ISO date)
  - `stops: string[]` (optional, default `[]`)
  - `budgetUsd: number` (required, `>= 0`)
  - `status: string` (required; one of `planned`, `in-progress`, `completed`)
  - `notes: string` (optional, default `""`)
- Success response:
  - HTTP 200
  - JSON updated trip object with all fields from `GET /api/trips/{id}`
- Error responses:
  - HTTP 400 for invalid `id` or invalid request body
  - HTTP 404 if trip is not found
  - HTTP 500 on unexpected server error

### 6) DELETE /api/trips/{id}
- Purpose: Delete a trip.
- Path params:
  - `id` (number, required)
- Request body: none
- Success response:
  - HTTP 204, empty body
- Error responses:
  - HTTP 400 for invalid `id`
  - HTTP 404 if trip is not found
  - HTTP 500 on unexpected server error

## DB Schema

### Table: trips
- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `title TEXT NOT NULL`
- `origin TEXT NOT NULL`
- `destination TEXT NOT NULL`
- `start_date TEXT NOT NULL` (ISO date)
- `end_date TEXT NOT NULL` (ISO date)
- `stops_json TEXT NOT NULL DEFAULT '[]'` (JSON-encoded string array)
- `budget_usd REAL NOT NULL DEFAULT 0`
- `status TEXT NOT NULL DEFAULT 'planned'`
- `notes TEXT NOT NULL DEFAULT ''`
- `created_at TEXT NOT NULL`
- `updated_at TEXT NOT NULL`

Relationships:
- No foreign keys required for this minimal single-resource scope.

Mapping notes:
- API `startDate` maps to `trips.start_date`
- API `endDate` maps to `trips.end_date`
- API `stops` maps to `trips.stops_json` (array encoded/decoded as JSON)
- API `budgetUsd` maps to `trips.budget_usd`
- API `createdAt` maps to `trips.created_at`
- API `updatedAt` maps to `trips.updated_at`

## Component Tree

### AppLayout
- Route: shared layout for `/`, `/trips/new`, `/trips/:id`, `/trips/:id/edit`
- Props: none
- Displays: app title and navigation links
- API: displays navigation to data-backed pages using `GET /api/trips`
- Children: `TripListPage`, `TripFormPage`, `TripDetailsPage`, `TripEditPage`

### TripListPage
- Route: `/`
- Props: none
- Fetch/display:
  - Fetches all trips via `GET /api/trips`
  - Fetches upcoming trips via `GET /api/trips/upcoming`
- API calls: `GET /api/trips`, `GET /api/trips/upcoming`, `DELETE /api/trips/{id}`
- Children: `TripFilterBar`, `TripCardList`

### TripFilterBar
- Route: `/` (inside `TripListPage`)
- Props:
  - `statusFilter: string`
  - `onStatusChange: function`
  - `onRefresh: function`
- Fetch/display: controls the `status` query used by `GET /api/trips`
- API calls: influences `GET /api/trips`
- Children: none

### TripCardList
- Route: `/` (inside `TripListPage`)
- Props:
  - `trips: Trip[]`
  - `onDelete: function`
- Fetch/display: renders list data returned from `GET /api/trips`
- API calls: triggers `DELETE /api/trips/{id}` through callback
- Children: `TripCard`

### TripCard
- Route: `/` (inside `TripCardList`)
- Props:
  - `trip: Trip`
  - `onDelete: function`
- Fetch/display: displays trip summary fields returned by `GET /api/trips`
- API calls: triggers `DELETE /api/trips/{id}` for the card's trip
- Children: none

### TripDetailsPage
- Route: `/trips/:id`
- Props: none
- Fetch/display: fetches and displays one trip via `GET /api/trips/{id}`
- API calls: `GET /api/trips/{id}`
- Children: `TripSummaryPanel`

### TripSummaryPanel
- Route: `/trips/:id` (inside `TripDetailsPage`)
- Props:
  - `trip: Trip`
- Fetch/display: renders full trip details from `GET /api/trips/{id}`
- API calls: displays response from `GET /api/trips/{id}`
- Children: none

### TripFormPage
- Route: `/trips/new`
- Props: none
- Fetch/display: creates a new trip via `POST /api/trips`
- API calls: `POST /api/trips`
- Children: `TripForm`

### TripEditPage
- Route: `/trips/:id/edit`
- Props: none
- Fetch/display:
  - Prefills form using `GET /api/trips/{id}`
  - Saves edits using `PUT /api/trips/{id}`
- API calls: `GET /api/trips/{id}`, `PUT /api/trips/{id}`
- Children: `TripForm`

### TripForm
- Route: `/trips/new`, `/trips/:id/edit` (inside form pages)
- Props:
  - `mode: string` (`create` or `edit`)
  - `initialValues: Trip | null`
  - `onSubmitSuccess: function`
- Fetch/display:
  - Collects title, origin, destination, dates, stops, budget, status, notes
- API calls:
  - `POST /api/trips` when mode is `create`
  - `PUT /api/trips/{id}` when mode is `edit`
- Children: none
