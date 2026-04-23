const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

async function handleResponse(response, fallbackMessage) {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.error || `${fallbackMessage} (HTTP ${response.status})`;
    throw new Error(message);
  }

  return payload;
}

// GET /api/trips - lists trips, optionally filtered by status
export async function getTrips(status = '') {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const response = await fetch(`/api/trips${query}`);
  return handleResponse(response, 'Failed to load trips');
}

// GET /api/trips/upcoming - lists upcoming planned trips
export async function getUpcomingTrips() {
  const response = await fetch('/api/trips/upcoming');
  return handleResponse(response, 'Failed to load upcoming trips');
}

// GET /api/trips/{id} - fetches one trip by id
export async function getTripById(id) {
  const response = await fetch(`/api/trips/${id}`);
  return handleResponse(response, `Failed to load trip ${id}`);
}

// POST /api/trips - creates a new trip
export async function createTrip(body) {
  const response = await fetch('/api/trips', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  return handleResponse(response, 'Failed to create trip');
}

// PUT /api/trips/{id} - updates an existing trip
export async function updateTrip(id, body) {
  const response = await fetch(`/api/trips/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  return handleResponse(response, `Failed to update trip ${id}`);
}

// DELETE /api/trips/{id} - deletes a trip by id
export async function deleteTrip(id) {
  const response = await fetch(`/api/trips/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    const message = payload?.error || `Failed to delete trip ${id} (HTTP ${response.status})`;
    throw new Error(message);
  }
}
