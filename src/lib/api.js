import { API_BASE, SAMPLE_MAPS } from "./constants";

export async function fetchSamplesMapping(instrument) {
  const url = `${API_BASE}/api/samples?instrument=${instrument}`;
  try {
    const res = await fetch(url);
    if (res.ok) return await res.json(); 
    return { mapping: SAMPLE_MAPS[instrument] };
  } catch {
    return { mapping: SAMPLE_MAPS[instrument] };
  }
}

export async function postSaveState(payload) {
  const url = `${API_BASE}/api/save-sequencer`;
  try {
    const res = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json(); // { ok, id }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

export async function getLatestState() {
  try {
    const listRes = await fetch(`${API_BASE}/api/states?limit=1`);
    if (!listRes.ok) return null;
    const listJson = await listRes.json();
    const id = listJson?.items?.[0]?._id;
    if (!id) return null;
    const stateRes = await fetch(`${API_BASE}/api/state/${id}`);
    if (!stateRes.ok) return null;
    const stateJson = await stateRes.json();
    return stateJson?.state || null;
  } catch {
    return null;
  }
}

export async function getStateById(id) {
  try {
    const res = await fetch(`${API_BASE}/api/state/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.state || null;
  } catch {
    return null;
  }
}
