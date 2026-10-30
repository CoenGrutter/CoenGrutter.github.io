export const RL_REPO = "CoenGrutter/CoenGrutter.github.io";
/** Orphan branch holding the snapshot inbox and the merged data file. */
export const RL_DATA_BRANCH = "rl-data";
export const RL_WORKFLOW = "rl-mmr.yml";
export const RL_DATA_URL = `https://raw.githubusercontent.com/${RL_REPO}/${RL_DATA_BRANCH}/rocket-league.json`;
export const RL_PROFILE_URL =
  "https://rocketleague.tracker.network/rocket-league/profile/epic/coen-_-";
export const TRACKER_ORIGIN = "https://rocketleague.tracker.network";

/** Shape of rocket-league.json, as written by scripts/rl-merge.mjs. */
export interface RlPlaylist {
  id: number;
  name: string;
  season: number | null;
  rating: number | null;
  percentile: number | null;
  tier: string | null;
  division: string | null;
  iconUrl: string | null;
  deltaUp: number | null;
  deltaDown: number | null;
  peakRating: number | null;
  matchesPlayed: number | null;
  streak: { type: string | null; value: number } | null;
}

export interface RlPoint {
  t: string;
  rating: number;
  tier?: string;
  division?: string;
}

export interface RlBand {
  tier: string;
  division: number;
  min: number;
  max: number;
}

export interface RlData {
  updatedAt: string;
  player: { handle: string | null; platform: string | null; season: number | null };
  lifetime: Record<string, number | null>;
  playlists: Record<string, RlPlaylist>;
  history: Record<string, RlPoint[]>;
  bands: Record<string, RlBand[]>;
}

/**
 * Bookmarklet source. Runs on the tracker.network profile page in the user's own browser,
 * fetches the same data the page itself loads, and hands it to /rl-sync via postMessage
 * (falling back to the clipboard if the popup can't be reached).
 */
export function bookmarkletSource(syncUrl: string) {
  const code = `(async()=>{
const S=${JSON.stringify(syncUrl)},O=new URL(S).origin,A="https://api.tracker.gg/api";
const m=location.pathname.match(/\\/rocket-league\\/profile\\/([^/]+)\\/([^/]+)/);
if(location.origin!==${JSON.stringify(TRACKER_ORIGIN)}||!m){alert("Open your Rocket League profile on tracker.network first.");return;}
const w=window.open(S,"rl-sync");
const j=async u=>{try{const r=await fetch(u);return r.ok?await r.json():null}catch(e){return null}};
const profile=await j(A+"/v2/rocket-league/standard/profile/"+m[1]+"/"+m[2]);
if(!profile||!profile.data){alert("Could not load the profile data from tracker.network.");return;}
const history=await j(A+"/v1/rocket-league/player-history/mmr/"+profile.data.metadata.playerId);
const distributions={};
for(const s of profile.data.segments){if(s.type!=="playlist")continue;const id=s.attributes.playlistId;const d=await j(A+"/v1/rocket-league/distribution/"+id);if(d)distributions[id]=d;}
const snapshot={capturedAt:new Date().toISOString(),profile,history,distributions};
const fallback=async()=>{const t=JSON.stringify(snapshot);try{await navigator.clipboard.writeText(t);alert("Snapshot copied. Paste it on the sync page.");}catch(e){const a=document.createElement("textarea");a.value=t;a.style.cssText="position:fixed;inset:10%;z-index:99999";document.body.appendChild(a);a.select();alert("Copy the selected text and paste it on the sync page.");}};
if(!w||w.closed){await fallback();return;}
let sent=false;
const h=e=>{if(e.origin===O&&e.data==="rl-sync-ready"&&!sent){sent=true;w.postMessage({type:"rl-snapshot",snapshot},O);removeEventListener("message",h);}};
addEventListener("message",h);
setTimeout(()=>{if(!sent){removeEventListener("message",h);fallback();}},15000);
})()`;
  return "javascript:" + encodeURIComponent(code.replace(/\n/g, ""));
}
