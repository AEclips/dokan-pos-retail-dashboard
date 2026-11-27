const CLOUD_CONFIG_KEY = 'dokanpos_cloud_sync_config';

export const CLOUD_SQL_SCHEMA = `CREATE TABLE IF NOT EXISTS dokan_stores (
  store_id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`;

export function loadCloudConfig() {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (!raw) {
      return {
        supabaseUrl: '',
        supabaseAnonKey: '',
        storeId: 'main-store-01',
        autoSync: false,
        lastSyncedAt: null
      };
    }
    return {
      supabaseUrl: '',
      supabaseAnonKey: '',
      storeId: 'main-store-01',
      autoSync: false,
      lastSyncedAt: null,
      ...JSON.parse(raw)
    };
  } catch {
    return {
      supabaseUrl: '',
      supabaseAnonKey: '',
      storeId: 'main-store-01',
      autoSync: false,
      lastSyncedAt: null
    };
  }
}

export function saveCloudConfig(config) {
  try {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
  } catch {}
}

export function isCloudConfigured(cloudConfig) {
  return Boolean(
    cloudConfig?.supabaseUrl?.trim() &&
      cloudConfig?.supabaseAnonKey?.trim() &&
      cloudConfig?.storeId?.trim()
  );
}

function normalizeUrl(url) {
  return url.trim().replace(/\/+$/, '');
}

export async function pushStoreToCloud(cloudConfig, storeData) {
  if (!isCloudConfigured(cloudConfig)) {
    throw new Error('Supabase URL, Anon Key, and Store ID are required.');
  }

  const base = normalizeUrl(cloudConfig.supabaseUrl);
  const endpoint = `${base}/rest/v1/dokan_stores?on_conflict=store_id`;
  const now = new Date().toISOString();

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: cloudConfig.supabaseAnonKey.trim(),
      Authorization: `Bearer ${cloudConfig.supabaseAnonKey.trim()}`,
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify([
      {
        store_id: cloudConfig.storeId.trim(),
        payload: storeData,
        updated_at: now
      }
    ])
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `Cloud push failed (${res.status})`);
  }

  return now;
}

export async function pullStoreFromCloud(cloudConfig) {
  if (!isCloudConfigured(cloudConfig)) {
    throw new Error('Supabase URL, Anon Key, and Store ID are required.');
  }

  const base = normalizeUrl(cloudConfig.supabaseUrl);
  const storeId = encodeURIComponent(cloudConfig.storeId.trim());
  const endpoint = `${base}/rest/v1/dokan_stores?store_id=eq.${storeId}&select=payload,updated_at`;

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      apikey: cloudConfig.supabaseAnonKey.trim(),
      Authorization: `Bearer ${cloudConfig.supabaseAnonKey.trim()}`
    }
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `Cloud pull failed (${res.status})`);
  }

  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0 || !rows[0]?.payload) {
    throw new Error(`No cloud snapshot found for store "${cloudConfig.storeId}".`);
  }

  return {
    payload: rows[0].payload,
    updatedAt: rows[0].updated_at || new Date().toISOString()
  };
}
