## API Spec

### GET /api/foods
- **Purpose:** Search the food database by name
- **Query params:** `q` (string, required) — search term
- **Request body:** none
- **Success response:** `200 OK`
  - `items`: array of food objects
    - `id`: integer
    - `name`: string
    - `calories_per_100g`: number
    - `protein_per_100g`: number
    - `carbs_per_100g`: number
    - `fat_per_100g`: number
- **Errors:**
  - `400` — `q` param missing or empty

---

### GET /api/foods/{id}
- **Purpose:** Retrieve a single food item by ID
- **Path param:** `id` (integer, required)
- **Request body:** none
- **Success response:** `200 OK`
  - `id`: integer
  - `name`: string
  - `calories_per_100g`: number
  - `protein_per_100g`: number
  - `carbs_per_100g`: number
  - `fat_per_100g`: number
- **Errors:**
  - `404` — food not found

---

### GET /api/entries
- **Purpose:** Retrieve all meal entries for a given date
- **Query params:** `date` (string, required, format `YYYY-MM-DD`)
- **Request body:** none
- **Success response:** `200 OK`
  - `date`: string
  - `entries`: array of entry objects
    - `id`: integer
    - `meal_type`: string (`breakfast` | `lunch` | `dinner` | `snack`)
    - `quantity_grams`: number
    - `food_id`: integer
    - `food_name`: string
    - `calories`: number (derived: `calories_per_100g * quantity_grams / 100`)
    - `protein`: number (derived)
    - `carbs`: number (derived)
    - `fat`: number (derived)
    - `created_at`: string (ISO 8601)
- **Errors:**
  - `400` — `date` param missing or invalid format

---

### POST /api/entries
- **Purpose:** Log a new meal entry
- **Request body (JSON, all required):**
  - `food_id`: integer
  - `meal_type`: string (`breakfast` | `lunch` | `dinner` | `snack`)
  - `quantity_grams`: number (must be > 0)
  - `date`: string (`YYYY-MM-DD`)
- **Success response:** `201 Created`
  - `id`: integer
  - `food_id`: integer
  - `meal_type`: string
  - `quantity_grams`: number
  - `date`: string
  - `created_at`: string
- **Errors:**
  - `400` — missing required field, invalid `meal_type`, or `quantity_grams` ≤ 0
  - `404` — `food_id` does not exist

---

### PUT /api/entries/{id}
- **Purpose:** Update the quantity of an existing meal entry
- **Path param:** `id` (integer, required)
- **Request body (JSON):**
  - `quantity_grams`: number (required, must be > 0)
- **Success response:** `200 OK`
  - `id`: integer
  - `food_id`: integer
  - `meal_type`: string
  - `quantity_grams`: number
  - `date`: string
  - `created_at`: string
- **Errors:**
  - `400` — `quantity_grams` missing or ≤ 0
  - `404` — entry not found

---

### DELETE /api/entries/{id}
- **Purpose:** Remove a meal entry
- **Path param:** `id` (integer, required)
- **Request body:** none
- **Success response:** `204 No Content`
- **Errors:**
  - `404` — entry not found

---

### GET /api/summary
- **Purpose:** Retrieve aggregated daily nutrition totals for a given date
- **Query params:** `date` (string, required, format `YYYY-MM-DD`)
- **Request body:** none
- **Success response:** `200 OK`
  - `date`: string
  - `total_calories`: number
  - `total_protein`: number
  - `total_carbs`: number
  - `total_fat`: number
  - `by_meal`: object keyed by `meal_type`
    - each key maps to: `calories`, `protein`, `carbs`, `fat` (all numbers)
- **Errors:**
  - `400` — `date` param missing or invalid format

---

## DB Schema

### Table: `foods`

| Column             | Type    | Constraints                  |
|--------------------|---------|------------------------------|
| id                 | INTEGER | PRIMARY KEY AUTOINCREMENT    |
| name               | TEXT    | NOT NULL                     |
| calories_per_100g  | REAL    | NOT NULL                     |
| protein_per_100g   | REAL    | NOT NULL                     |
| carbs_per_100g     | REAL    | NOT NULL                     |
| fat_per_100g       | REAL    | NOT NULL                     |

- No foreign keys.
- `name` should be indexed for text search performance.

---

### Table: `meal_entries`

| Column          | Type    | Constraints                                              |
|-----------------|---------|----------------------------------------------------------|
| id              | INTEGER | PRIMARY KEY AUTOINCREMENT                                |
| food_id         | INTEGER | NOT NULL, FOREIGN KEY REFERENCES foods(id)               |
| meal_type       | TEXT    | NOT NULL, CHECK(meal_type IN ('breakfast','lunch','dinner','snack')) |
| quantity_grams  | REAL    | NOT NULL, CHECK(quantity_grams > 0)                      |
| date            | TEXT    | NOT NULL (format: YYYY-MM-DD)                            |
| created_at      | TEXT    | NOT NULL, DEFAULT (datetime('now'))                      |

- Foreign key: `food_id` → `foods(id)`
- Index on `date` to support efficient daily queries.
- Derived fields (`calories`, `protein`, `carbs`, `fat`) are computed at query time by joining with `foods` and applying `value_per_100g * quantity_grams / 100`; they are not stored.

---

## Component Tree

### `App`
- **Route:** all routes (root wrapper)
- **Props:** none
- **Data:** none
- **API calls:** none
- **Children:** `NavBar`, `DailyLogPage`, `FoodSearchPage`

---

### `NavBar`
- **Route:** all routes (persistent)
- **Props:** none
- **Data:** current selected date (from app state / URL param)
- **API calls:** none
- **Children:** `DatePicker`

---

### `DatePicker`
- **Route:** all routes (inside NavBar)
- **Props:** `selectedDate: string`, `onDateChange: (date: string) => void`
- **Data:** controlled date value
- **API calls:** none
- **Children:** none

---

### `DailyLogPage`
- **Route:** `/` (home / daily log view)
- **Props:** none
- **Data:** fetches entries and summary for the selected date
- **API calls:** `GET /api/entries?date=`, `GET /api/summary?date=`
- **Children:** `NutritionSummaryCard`, `MealSection` (rendered once per meal type: breakfast, lunch, dinner, snack)

---

### `NutritionSummaryCard`
- **Route:** `/`
- **Props:** `summary: { total_calories: number, total_protein: number, total_carbs: number, total_fat: number }`
- **Data:** displays aggregated daily totals passed from `DailyLogPage`
- **API calls:** none (data passed via props)
- **Children:** none

---

### `MealSection`
- **Route:** `/`
- **Props:** `mealType: string`, `entries: Entry[]`, `onEntryDeleted: (id: number) => void`, `onEntryUpdated: (id: number, grams: number) => void`
- **Data:** displays all logged entries for one meal type
- **API calls:** none (data passed via props)
- **Children:** `MealEntryRow` (one per entry), `AddFoodButton`

---

### `MealEntryRow`
- **Route:** `/`
- **Props:** `entry: Entry`, `onDelete: (id: number) => void`, `onUpdate: (id: number, grams: number) => void`
- **Data:** displays food name, quantity, and derived macro values for one entry
- **API calls:** `PUT /api/entries/{id}` (on quantity edit), `DELETE /api/entries/{id}` (on delete)
- **Children:** none

---

### `AddFoodButton`
- **Route:** `/`
- **Props:** `mealType: string`, `date: string`, `onEntryAdded: () => void`
- **Data:** none; opens food search modal
- **API calls:** none
- **Children:** renders `FoodSearchModal` when active

---

### `FoodSearchModal`
- **Route:** `/` (modal overlay)
- **Props:** `mealType: string`, `date: string`, `onClose: () => void`, `onEntryAdded: () => void`
- **Data:** manages search query and results list
- **API calls:** `GET /api/foods?q=`
- **Children:** `FoodSearchBar`, `FoodSearchResults`

---

### `FoodSearchBar`
- **Route:** `/` (inside FoodSearchModal)
- **Props:** `query: string`, `onQueryChange: (q: string) => void`
- **Data:** controlled text input
- **API calls:** none (triggers parent to call `GET /api/foods?q=`)
- **Children:** none

---

### `FoodSearchResults`
- **Route:** `/` (inside FoodSearchModal)
- **Props:** `results: Food[]`, `mealType: string`, `date: string`, `onEntryAdded: () => void`
- **Data:** displays list of matching foods
- **API calls:** none (data passed via props)
- **Children:** `FoodResultItem` (one per result)

---

### `FoodResultItem`
- **Route:** `/` (inside FoodSearchResults)
- **Props:** `food: Food`, `mealType: string`, `date: string`, `onEntryAdded: () => void`
- **Data:** displays food name and macros per 100g; allows user to enter a quantity and confirm
- **API calls:** `POST /api/entries`
- **Children:** none
