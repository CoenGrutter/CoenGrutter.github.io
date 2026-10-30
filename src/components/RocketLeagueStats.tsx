import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  RL_DATA_URL,
  RL_PROFILE_URL,
  type RlBand,
  type RlData,
  type RlPlaylist,
  type RlPoint,
} from "@/lib/rocketLeague";

// ranked playlists first, in the order tracker.network shows them
const ORDER = [10, 11, 13, 61, 34, 27, 28, 29, 30, 63];
const DAY = 24 * 60 * 60 * 1000;

const fmt = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-US"));

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** All-time best: tracker's cross-season peak, unless this season or the recorded history beat it. */
function bestPeak(p: RlPlaylist, points: RlPoint[] = []) {
  const candidates = [p.allTimePeak?.rating, p.peakRating, ...points.map((pt) => pt.rating)].filter(
    (n): n is number => n != null,
  );
  if (candidates.length === 0) return null;
  const rating = Math.max(...candidates);
  const season = p.allTimePeak && p.allTimePeak.rating === rating ? p.allTimePeak.season : p.season;
  return { rating, season };
}

/** Rating change versus the last point recorded at least `days` ago. */
function change(points: RlPoint[], current: number | null, days: number) {
  if (current == null || points.length === 0) return null;
  const cutoff = Date.now() - days * DAY;
  const before = [...points].reverse().find((p) => new Date(p.t).getTime() <= cutoff);
  return before ? current - before.rating : null;
}

export default function RocketLeagueStats() {
  const [data, setData] = useState<RlData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(11);

  useEffect(() => {
    // the query keeps the service worker's .json cache rule from serving a stale copy
    fetch(`${RL_DATA_URL}?t=${Date.now()}`, { cache: "no-cache" })
      .then((r) => {
        if (r.status === 404) throw new Error("No Rocket League data synced yet.");
        if (!r.ok) throw new Error("Failed to fetch Rocket League data");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Unknown error"));
  }, []);

  const playlists = useMemo(() => {
    if (!data) return [];
    const rank = (id: number) => (ORDER.includes(id) ? ORDER.indexOf(id) : ORDER.length + id);
    return Object.values(data.playlists)
      // casual and other unranked playlists only confuse people who don't play
      .filter((p) => p.rating != null && p.id !== 0 && p.tier !== "Unranked")
      .sort((a, b) => rank(a.id) - rank(b.id));
  }, [data]);

  if (error) return <div className="mt-6 text-muted-foreground">{error}</div>;
  if (!data) return <div className="mt-6 text-muted-foreground">Loading Rocket League data...</div>;

  const current = data.playlists[selected] ?? playlists[0];
  if (!current) return null;
  const points = data.history[current.id] ?? [];

  return (
    <div className="mt-6 flex flex-col gap-4">
      <PlaylistTable playlists={playlists} history={data.history} selected={current.id} onSelect={setSelected} />
      <PlaylistDetail playlist={current} points={points} bands={data.bands[current.id] ?? []} />
      <div className="flex flex-wrap justify-between gap-2 px-1 text-xs text-muted-foreground">
        <span>Last updated {timeAgo(data.updatedAt)}</span>
        <a
          href={`${RL_PROFILE_URL}/overview`}
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-foreground"
        >
          Data from tracker.network →
        </a>
      </div>
    </div>
  );
}

function PeakCell({ peak }: { peak: ReturnType<typeof bestPeak> }) {
  return (
    <div className="flex flex-col">
      <span className="font-semibold text-foreground">{fmt(peak?.rating)}</span>
      {peak?.season != null && <span className="text-xs text-muted-foreground">Season {peak.season}</span>}
    </div>
  );
}

function PlaylistTable({
  playlists,
  history,
  selected,
  onSelect,
}: {
  playlists: RlPlaylist[];
  history: RlData["history"];
  selected: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-md bg-gradient-to-br from-white/5 to-white/3 p-2">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Playlist / Rank</th>
            <th className="px-3 py-2 font-medium">Rating</th>
            <th className="hidden px-3 py-2 font-medium sm:table-cell">MMR up / down</th>
            <th className="hidden px-3 py-2 font-medium sm:table-cell">Peak</th>
            <th className="hidden px-3 py-2 font-medium md:table-cell">Matches this season</th>
          </tr>
        </thead>
        <tbody>
          {playlists.map((p) => (
            <tr
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={cn(
                "cursor-pointer transition hover:bg-white/5",
                p.id === selected && "bg-primary/10 hover:bg-primary/15",
              )}
            >
              <td className="rounded-l-md px-3 py-2">
                <div className="flex items-center gap-3">
                  {p.iconUrl && (
                    <img src={p.iconUrl} alt="" width={32} height={32} loading="lazy" className="h-8 w-8 shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-tight text-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.tier} {p.division}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">{fmt(p.rating)}</span>
                  {p.percentile != null && (
                    <span className="text-xs text-muted-foreground">
                      {p.percentile >= 50
                        ? `Top ${Math.max(0.1, 100 - p.percentile).toFixed(1)}%`
                        : `Bottom ${p.percentile.toFixed(1)}%`}
                    </span>
                  )}
                </div>
              </td>
              <td className="hidden px-3 py-2 sm:table-cell">
                <span className="text-green-400">{p.deltaUp != null ? `▲ ${p.deltaUp}` : ""}</span>{" "}
                <span className="text-red-400">{p.deltaDown != null ? `▼ ${p.deltaDown}` : ""}</span>
              </td>
              <td className="hidden px-3 py-2 sm:table-cell">
                <PeakCell peak={bestPeak(p, history[p.id])} />
              </td>
              <td className="hidden rounded-r-md px-3 py-2 text-foreground md:table-cell">
                {fmt(p.matchesPlayed)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Delta({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-semibold",
          value == null || value === 0 ? "text-foreground" : value > 0 ? "text-green-400" : "text-red-400",
        )}
      >
        {value == null ? "—" : `${value > 0 ? "+" : ""}${value}`}
      </span>
    </div>
  );
}

function PlaylistDetail({ playlist, points, bands }: { playlist: RlPlaylist; points: RlPoint[]; bands: RlBand[] }) {
  const peak = bestPeak(playlist, points);

  return (
    <div className="rounded-md bg-gradient-to-br from-white/5 to-white/3 p-4">
      <div className="mb-4 flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-3">
          {playlist.iconUrl && <img src={playlist.iconUrl} alt="" width={48} height={48} className="h-12 w-12" />}
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight text-foreground">{playlist.name}</span>
            <span className="text-sm text-muted-foreground">
              {playlist.tier} {playlist.division}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Rating</span>
          <span className="font-semibold text-foreground">{fmt(playlist.rating)}</span>
        </div>
        <Delta label="Day" value={change(points, playlist.rating, 1)} />
        <Delta label="Week" value={change(points, playlist.rating, 7)} />
        <Delta label="Month" value={change(points, playlist.rating, 30)} />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            All-time peak{peak?.season != null && ` (S${peak.season})`}
          </span>
          <span className="font-semibold text-foreground">{fmt(peak?.rating)}</span>
        </div>
      </div>
      {points.length >= 2 ? (
        <MmrChart points={points} bands={bands} />
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">Not enough history for a chart yet.</div>
      )}
    </div>
  );
}

function MmrChart({ points, bands }: { points: RlPoint[]; bands: RlBand[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const width = 760;
  const height = 280;
  const pad = { top: 12, right: 16, bottom: 28, left: 44 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const times = points.map((p) => new Date(p.t).getTime());
  const t0 = times[0]!;
  const t1 = times[times.length - 1]!;
  const ratings = points.map((p) => p.rating);
  const minY = Math.floor((Math.min(...ratings) - 30) / 100) * 100;
  const maxY = Math.ceil((Math.max(...ratings) + 30) / 100) * 100;

  const xFor = (t: number) => pad.left + ((t - t0) / (t1 - t0 || 1)) * innerW;
  const yFor = (r: number) => pad.top + (1 - (r - minY) / (maxY - minY || 1)) * innerH;
  const clampY = (r: number) => yFor(Math.min(maxY, Math.max(minY, r)));

  // one band per tier, spanning its divisions
  const tierBands = useMemo(() => {
    const byTier = new Map<string, { tier: string; min: number; max: number }>();
    for (const b of bands) {
      const t = byTier.get(b.tier);
      byTier.set(b.tier, t ? { ...t, min: Math.min(t.min, b.min), max: Math.max(t.max, b.max) } : { ...b });
    }
    return [...byTier.values()].filter((b) => b.max >= minY && b.min <= maxY);
  }, [bands, minY, maxY]);

  const months = useMemo(() => {
    const out: number[] = [];
    const d = new Date(t0);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() + 1);
    const span = (t1 - t0) / DAY;
    const step = span > 900 ? 6 : span > 400 ? 3 : span > 200 ? 2 : 1;
    for (; d.getTime() <= t1; d.setMonth(d.getMonth() + step)) out.push(d.getTime());
    return out;
  }, [t0, t1]);

  const yTicks = [];
  const yStep = maxY - minY > 800 ? 200 : 100;
  for (let r = minY; r <= maxY; r += yStep) yTicks.push(r);

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(times[i]!)} ${yFor(p.rating)}`).join(" ");

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = t0 + ((e.clientX - rect.left) / rect.width) * (t1 - t0);
    let best = 0;
    for (let i = 1; i < times.length; i++) {
      if (Math.abs(times[i]! - t) < Math.abs(times[best]! - t)) best = i;
    }
    setHover(best);
  };

  const hp = hover != null ? points[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="MMR progression">
        {/* rank bands */}
        {tierBands.map((b, i) => {
          const y1 = clampY(b.max);
          const y2 = clampY(b.min);
          return (
            <g key={b.tier}>
              <rect
                x={pad.left}
                y={y1}
                width={innerW}
                height={Math.max(0, y2 - y1 - 2)}
                fill={i % 2 ? "rgba(124,92,252,0.07)" : "rgba(124,92,252,0.13)"}
              />
              {y2 - y1 > 16 && (
                <text x={pad.left + 8} y={y1 + 14} fill="rgba(255,255,255,0.45)" fontSize={11}>
                  {b.tier}
                </text>
              )}
            </g>
          );
        })}

        {yTicks.map((r) => (
          <text key={r} x={8} y={yFor(r) + 4} fill="rgba(255,255,255,0.7)" fontSize={11}>
            {r}
          </text>
        ))}

        {months.map((t) => (
          <text key={t} x={xFor(t)} y={height - 6} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize={11}>
            {new Date(t).toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}
          </text>
        ))}

        <path d={pathD} fill="none" stroke="#7C5CFC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {hp && (
          <g pointerEvents="none">
            <line
              x1={xFor(times[hover!]!)}
              x2={xFor(times[hover!]!)}
              y1={pad.top}
              y2={height - pad.bottom}
              stroke="rgba(255,255,255,0.25)"
            />
            <circle cx={xFor(times[hover!]!)} cy={yFor(hp.rating)} r={5} fill="#fff" stroke="#7C5CFC" strokeWidth={2} />
          </g>
        )}

        <rect
          x={pad.left}
          y={pad.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      {hp && (
        <div
          style={{
            position: "absolute",
            left: `${(xFor(times[hover!]!) / width) * 100}%`,
            top: `${(yFor(hp.rating) / height) * 100}%`,
            transform: "translate(-50%, -120%)",
            pointerEvents: "none",
            zIndex: 50,
          }}
          className="whitespace-nowrap rounded-md bg-foreground/95 px-3 py-1.5 text-xs text-background shadow-xl"
        >
          <div className="flex flex-col items-center text-center">
            <span className="opacity-80">
              {new Date(hp.t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="font-bold">{hp.rating.toLocaleString("en-US")}</span>
            {hp.tier && (
              <span className="opacity-80">
                {hp.tier} {hp.division}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
