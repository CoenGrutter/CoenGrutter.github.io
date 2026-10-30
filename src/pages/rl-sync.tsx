import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  RL_DATA_BRANCH,
  RL_PROFILE_URL,
  RL_REPO,
  RL_WORKFLOW,
  TRACKER_ORIGIN,
  bookmarkletSource,
} from "@/lib/rocketLeague";

const TOKEN_KEY = "rl-sync-token";
const API = `https://api.github.com/repos/${RL_REPO}`;

function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

async function gh(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    // GitHub sends max-age=60; a cached file sha makes the next PUT fail with 409
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (res.status === 404 && (init.method ?? "GET") === "GET") return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status} on ${path}: ${body.slice(0, 200)}`);
  }
  return res.status === 204 ? {} : res.json();
}

/** Creates the rl-data branch as an orphan so it doesn't carry the site's files. */
async function ensureBranch(token: string) {
  if (await gh(token, `/branches/${RL_DATA_BRANCH}`)) return;
  const tree = await gh(token, "/git/trees", {
    method: "POST",
    body: JSON.stringify({
      tree: [
        {
          path: "README.md",
          mode: "100644",
          type: "blob",
          content: "Rocket League MMR data, written by the rl-mmr workflow. Do not merge into main.\n",
        },
      ],
    }),
  });
  const commit = await gh(token, "/git/commits", {
    method: "POST",
    body: JSON.stringify({ message: "chore: init rl-data branch", tree: tree.sha, parents: [] }),
  });
  await gh(token, "/git/refs", {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${RL_DATA_BRANCH}`, sha: commit.sha }),
  });
}

async function upload(token: string, snapshot: unknown) {
  await ensureBranch(token);
  const content = toBase64(JSON.stringify(snapshot));
  const put = async () => {
    const current = await gh(token, `/contents/inbox.json?ref=${RL_DATA_BRANCH}`);
    await gh(token, "/contents/inbox.json", {
      method: "PUT",
      body: JSON.stringify({
        message: "chore: new Rocket League snapshot",
        content,
        branch: RL_DATA_BRANCH,
        ...(current?.sha ? { sha: current.sha } : {}),
      }),
    });
  };
  try {
    await put();
  } catch (err) {
    // the file changed between reading its sha and writing it; read again once
    if (!(err instanceof Error && err.message.startsWith("GitHub 409"))) throw err;
    await put();
  }
  await gh(token, `/actions/workflows/${RL_WORKFLOW}/dispatches`, {
    method: "POST",
    body: JSON.stringify({ ref: "main" }),
  });
}

function describe(snapshot: any) {
  const playlists = snapshot?.profile?.data?.segments?.filter((s: any) => s.type === "playlist").length ?? 0;
  const parts = [`${playlists} playlists`];
  parts.push(snapshot?.history ? "MMR history included" : "no MMR history (only current ratings)");
  parts.push(`${Object.keys(snapshot?.distributions ?? {}).length} rank distributions`);
  return parts.join(", ");
}

export default function RlSync() {
  const [token, setToken] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [pasted, setPasted] = useState("");
  const received = useRef(false);
  const bookmarkRef = useRef<HTMLAnchorElement>(null);

  const say = (line: string) => setLog((l) => [...l, line]);

  useEffect(() => {
    try {
      setToken(localStorage.getItem(TOKEN_KEY) ?? "");
    } catch {}
    // set via the DOM so React doesn't complain about a javascript: href
    bookmarkRef.current?.setAttribute(
      "href",
      bookmarkletSource(`${window.location.origin}${window.location.pathname}`),
    );
  }, []);

  const sync = useCallback(async (snapshot: unknown) => {
    const t = (() => {
      try {
        return localStorage.getItem(TOKEN_KEY) ?? "";
      } catch {
        return "";
      }
    })();
    if (!t) {
      say("No GitHub token saved; add one below and paste the snapshot.");
      return;
    }
    setBusy(true);
    say(`Received snapshot: ${describe(snapshot)}.`);
    try {
      await upload(t, snapshot);
      say("Uploaded and started the rl-mmr workflow. The site redeploys with the new data in a few minutes.");
    } catch (err) {
      say(`Failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(false);
    }
  }, []);

  // handshake with the bookmarklet: announce readiness until a snapshot arrives
  useEffect(() => {
    if (!window.opener) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== TRACKER_ORIGIN || e.data?.type !== "rl-snapshot" || received.current) return;
      received.current = true;
      void sync(e.data.snapshot);
    };
    window.addEventListener("message", onMessage);
    const id = setInterval(() => {
      if (received.current) return clearInterval(id);
      try {
        window.opener?.postMessage("rl-sync-ready", TRACKER_ORIGIN);
      } catch {}
    }, 500);
    return () => {
      window.removeEventListener("message", onMessage);
      clearInterval(id);
    };
  }, [sync]);

  return (
    <>
      <Head>
        <title>Rocket League sync</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-16 text-foreground">
        <h1 className="text-2xl font-semibold tracking-tight">Rocket League sync</h1>

        <section className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            1. Drag this button to your bookmarks bar:{" "}
            <a
              ref={bookmarkRef}
              className="ml-1 rounded-md bg-primary px-3 py-1.5 font-semibold text-primary-foreground"
              onClick={(e) => e.preventDefault()}
            >
              RL sync
            </a>
          </p>
          <p>
            2. Open your{" "}
            <a className="underline" href={RL_PROFILE_URL} target="_blank" rel="noopener noreferrer">
              tracker.network profile
            </a>{" "}
            and click the bookmark. This page opens and uploads the snapshot.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="token">
            GitHub token
          </label>
          <p className="text-xs text-muted-foreground">
            Fine-grained token for {RL_REPO} only, with Contents: read &amp; write and Actions: read &amp;
            write. Stored in this browser only.
          </p>
          <input
            id="token"
            type="password"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              try {
                localStorage.setItem(TOKEN_KEY, e.target.value);
              } catch {}
            }}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
            placeholder="github_pat_…"
          />
        </section>

        <section className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="paste">
            Paste a snapshot manually
          </label>
          <p className="text-xs text-muted-foreground">
            Only needed if the bookmark copied the snapshot to your clipboard instead.
          </p>
          <textarea
            id="paste"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={4}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs"
          />
          <button
            disabled={busy || !pasted}
            onClick={() => {
              try {
                void sync(JSON.parse(pasted));
              } catch {
                say("That isn't valid JSON.");
              }
            }}
            className="self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Upload
          </button>
        </section>

        {log.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-md bg-white/5 p-4 font-mono text-xs text-muted-foreground">
            {log.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
