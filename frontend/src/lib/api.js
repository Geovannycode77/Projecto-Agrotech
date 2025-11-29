// Small API abstraction helper for future backend integration
// Right now these functions use localStorage or in-memory data to simulate calls
// TODO: Replace with real fetch() requests to Django REST endpoints

export async function fetchAlerts() {
  // Example: return fetch('/api/alerts').then(r => r.json())
  return [];
}

export async function fetchInsumos() {
  try {
    const raw = localStorage.getItem("insumos_items");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function persistInsumos(items) {
  localStorage.setItem("insumos_items", JSON.stringify(items));
  return items;
}

export async function fetchReproRecords() {
  try {
    const raw = localStorage.getItem("repro_records");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function persistReproRecords(records) {
  localStorage.setItem("repro_records", JSON.stringify(records));
  return records;
}

// Add more placeholders for CRUD operations as needed
