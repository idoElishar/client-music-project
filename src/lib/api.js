import { API_BASE } from "./constants";

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
  payload={ ...payload, userName: localStorage.getItem("username") }
    const url = `${API_BASE}/api/save-sequencer`;
  try {
    const res = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

export async function getLatestState() {
  try {
    const listRes = await fetch(`${API_BASE}/api/states/${localStorage.getItem("username")}`);
    if (!listRes.ok) return null;
    const listJson = await listRes.json();
    return listJson.state;
  } catch {
    return null;
  }
}

export async function getStateById(id) {
  try {
    const qs = localStorage.getItem("username");
    const res = await fetch(`${API_BASE}/api/state/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: qs }),
    }); 
    if (!res.ok) return null;
    const json = await res.json();
    return json?.state || null;
  } catch {
    return null;
  }
}
