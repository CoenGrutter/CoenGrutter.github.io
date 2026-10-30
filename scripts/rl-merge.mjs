// Merges a raw tracker.network snapshot (written by /rl-sync) into the Rocket League data file.
// Usage: node scripts/rl-merge.mjs <inbox.json> <rocket-league.json>
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const [inboxPath, dataPath] = process.argv.slice(2);
if (!inboxPath || !dataPath) {
  console.error("Usage: node scripts/rl-merge.mjs <inbox.json> <rocket-league.json>");
  process.exit(1);
}

if (!existsSync(inboxPath)) {
  console.log(`No snapshot at ${inboxPath}, nothing to merge.`);
  process.exit(0);
}

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new Error(`Could not parse ${path}: ${err.message}`);
  }
};

const inbox = readJson(inboxPath);
const existing = existsSync(dataPath) ? readJson(dataPath) : { history: {}, bands: {} };

const profile = inbox?.profile?.data;
if (!Array.isArray(profile?.segments)) {
  throw new Error("Snapshot has no profile segments; is it a tracker.network profile response?");
}

const stat = (stats, key) => stats?.[key]?.value ?? null;

// --- current state per playlist ---
const playlists = {};
for (const seg of profile.segments) {
  if (seg.type !== "playlist") continue;
  const id = String(seg.attributes.playlistId);
  const s = seg.stats;
  playlists[id] = {
    id: Number(id),
    name: seg.metadata?.name ?? `Playlist ${id}`,
    season: seg.attributes.season ?? null,
    rating: stat(s, "rating"),
    percentile: s?.rating?.percentile ?? null,
    tier: s?.tier?.metadata?.name ?? null,
    division: s?.division?.metadata?.name ?? null,
    iconUrl: s?.tier?.metadata?.iconUrl ?? null,
    deltaUp: s?.division?.metadata?.deltaUp ?? null,
    deltaDown: s?.division?.metadata?.deltaDown ?? null,
    peakRating: stat(s, "peakRating"),
    matchesPlayed: stat(s, "matchesPlayed"),
    streak: s?.winStreak
      ? { type: s.winStreak.metadata?.type ?? null, value: s.winStreak.value }
      : null,
  };
}

const overview = profile.segments.find((s) => s.type === "overview")?.stats ?? {};
const lifetime = {};
for (const key of ["wins", "goals", "mVPs", "saves", "assists", "shots", "goalShotRatio"]) {
  lifetime[key] = stat(overview, key);
}

// --- history: tracker's own points, plus a point whenever the current rating changed ---
const toIso = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

/** @type {Record<string, Map<string, {t: string, rating: number, tier?: string, division?: string}>>} */
const history = {};
const add = (playlistId, point) => {
  const key = String(playlistId);
  history[key] ??= new Map();
  // one point per playlist per minute; later sources win
  history[key].set(point.t.slice(0, 16), point);
};

for (const [id, points] of Object.entries(existing.history ?? {})) {
  for (const p of points) add(id, p);
}

// The history response shape isn't documented, so accept the common variants:
// { data: { "<playlistId>": [entry] } } or { data: [entry with playlistId] }.
const rawHistory = inbox.history?.data ?? inbox.history;
const addEntry = (playlistId, e) => {
  if (playlistId == null || !e || typeof e !== "object") return;
  const t = toIso(e.collectDate ?? e.date ?? e.timestamp ?? e.createdAt);
  const rating = Number(e.rating ?? e.value ?? e.mmr);
  if (!t || !Number.isFinite(rating)) return;
  const tier = typeof e.tier === "string" ? e.tier : e.tierName ?? e.tierInfo?.name;
  const division = typeof e.division === "string" ? e.division : e.divisionName;
  add(playlistId, { t, rating, ...(tier && { tier }), ...(division && { division }) });
};
if (Array.isArray(rawHistory)) {
  for (const e of rawHistory) addEntry(e?.playlistId ?? e?.playlist, e);
} else if (rawHistory && typeof rawHistory === "object") {
  for (const [id, entries] of Object.entries(rawHistory)) {
    if (Array.isArray(entries)) for (const e of entries) addEntry(e?.playlistId ?? id, e);
  }
}

const now = toIso(profile.metadata?.lastUpdated?.value ?? inbox.capturedAt) ?? new Date().toISOString();
for (const p of Object.values(playlists)) {
  if (p.rating == null) continue;
  const points = [...(history[p.id]?.values() ?? [])].sort((a, b) => a.t.localeCompare(b.t));
  const last = points[points.length - 1];
  if (!last || last.rating !== p.rating) {
    add(p.id, {
      t: now,
      rating: p.rating,
      ...(p.tier && { tier: p.tier }),
      ...(p.division && { division: p.division }),
    });
  }
}

const sortedHistory = {};
for (const id of Object.keys(history).sort((a, b) => a - b)) {
  sortedHistory[id] = [...history[id].values()].sort((a, b) => a.t.localeCompare(b.t));
}

// --- rank bands from the distribution responses ---
const bands = { ...(existing.bands ?? {}) };
for (const [id, dist] of Object.entries(inbox.distributions ?? {})) {
  const tiers = dist?.data?.tiers;
  const rows = dist?.data?.data;
  if (!Array.isArray(tiers) || !Array.isArray(rows)) continue;
  bands[id] = rows
    .filter((r) => String(r.playlist) === id && r.tier > 0)
    .map((r) => ({ tier: tiers[r.tier], division: r.division, min: r.minMMR, max: r.maxMMR }));
}

const result = {
  updatedAt: now,
  player: {
    handle: profile.platformInfo?.platformUserHandle ?? null,
    platform: profile.platformInfo?.platformSlug ?? null,
    season: profile.metadata?.currentSeason ?? null,
  },
  lifetime,
  playlists,
  history: sortedHistory,
  bands,
};

// updatedAt follows tracker's own refresh time, so an unchanged profile produces an identical file
const next = JSON.stringify(result, null, 2) + "\n";
if (existsSync(dataPath) && readFileSync(dataPath, "utf8") === next) {
  console.log("Data unchanged.");
} else {
  writeFileSync(dataPath, next);
  const total = Object.values(sortedHistory).reduce((n, h) => n + h.length, 0);
  console.log(`Wrote ${dataPath}: ${Object.keys(playlists).length} playlists, ${total} history points.`);
}
