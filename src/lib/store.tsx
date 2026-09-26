"use client"

import * as React from "react"
import { EXAMPLE_NAMES, type DeckId } from "@/lib/content"
import type { RoomAction, RoomResponse, SharedState, Team } from "@/lib/room-types"

export type { Team }

/** "live" = shared with every phone through the server; "local" = this phone only. */
export type SyncMode = "connecting" | "live" | "local"

type LocalOnly = { picked: string[]; deviceId: string; dismissedVote: string | null }

const LOCAL_KEY = "back-to-class-v1"
const DEVICE_KEY = "back-to-class-device"
const POLL_MS = 2500

const freshShared = (): SharedState => ({
  roster: EXAMPLE_NAMES.join("\n"),
  rosterIsExample: true,
  teams: [],
  custom: {},
  vote: null,
  votes: {},
})

function readLocal(): SharedState & { picked: string[] } {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) return { ...freshShared(), picked: [], ...JSON.parse(raw), vote: null, votes: {} }
  } catch {}
  return { ...freshShared(), picked: [] }
}

function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(DEVICE_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

type Ctx = {
  state: SharedState & LocalOnly
  mode: SyncMode
  names: string[]
  setRoster: (roster: string) => void
  setTeams: (teams: Omit<Team, "score">[]) => void
  bumpScore: (team: number, n: number) => void
  resetScores: () => void
  addCard: (deck: DeckId, text: string) => void
  markPicked: (name: string, reset: boolean) => void
  startVote: (prompt: string) => void
  castVote: (name: string) => void
  revealVote: () => void
  closeVote: () => void
  dismissVote: () => void
}

const PartyContext = React.createContext<Ctx | null>(null)

export function PartyProvider({ children }: { children: React.ReactNode }) {
  // The app renders client-side only, so localStorage is safe in initialisers.
  const [shared, setShared] = React.useState<SharedState>(() => {
    const s = readLocal()
    return { roster: s.roster, rosterIsExample: s.rosterIsExample, teams: s.teams, custom: s.custom, vote: null, votes: {} }
  })
  const [local, setLocal] = React.useState<LocalOnly>(() => ({
    picked: readLocal().picked,
    deviceId: deviceId(),
    dismissedVote: null,
  }))
  const [mode, setMode] = React.useState<SyncMode>("connecting")
  const ver = React.useRef<number | null>(null)

  const accept = React.useCallback((res: RoomResponse) => {
    if (!res.enabled) {
      setMode("local")
      return
    }
    setMode("live")
    ver.current = res.ver
    if (!res.same) setShared(res.state)
  }, [])

  // Poll the server while the page is visible. One cheap request when nothing changed.
  React.useEffect(() => {
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    const tick = async () => {
      if (stopped) return
      if (document.visibilityState === "visible") {
        try {
          const q = ver.current === null ? "" : `?v=${ver.current}`
          const res = await fetch(`/api/room${q}`, { cache: "no-store" })
          if (!res.ok) throw new Error(String(res.status))
          const body: RoomResponse = await res.json()
          if (stopped) return
          accept(body)
          if (!body.enabled) return // no server: stay local, stop polling
        } catch {
          // Offline or server hiccup: keep what we have and try again.
          if (ver.current === null) setMode("local")
        }
      }
      timer = setTimeout(tick, POLL_MS)
    }
    tick()
    const onVisible = () => { if (document.visibilityState === "visible") { clearTimeout(timer); tick() } }
    document.addEventListener("visibilitychange", onVisible)
    return () => { stopped = true; clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible) }
  }, [accept])

  // Local mode (and the picker in every mode) persists on this phone.
  React.useEffect(() => {
    if (mode === "connecting") return
    try {
      const { roster, rosterIsExample, teams, custom } = shared
      localStorage.setItem(LOCAL_KEY, JSON.stringify({ roster, rosterIsExample, teams, custom, picked: local.picked }))
    } catch {}
  }, [shared, local.picked, mode])

  const modeRef = React.useRef(mode)
  React.useEffect(() => { modeRef.current = mode }, [mode])

  /** Apply the change here straight away, then send it to the server when live. */
  const act = React.useCallback(
    (action: RoomAction, optimistic: (s: SharedState) => SharedState) => {
      setShared(optimistic)
      if (modeRef.current !== "live") return
      fetch("/api/room", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action) })
        .then((r) => r.json())
        .then(accept)
        .catch(() => {})
    },
    [accept]
  )

  const names = React.useMemo(
    () => shared.roster.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean),
    [shared.roster]
  )

  const value = React.useMemo<Ctx>(() => {
    const voteId = shared.vote?.id ?? ""
    return {
      state: { ...shared, ...local },
      mode,
      names,
      setRoster: (roster) => {
        act({ type: "setRoster", roster }, (s) => ({ ...s, roster, rosterIsExample: false }))
        setLocal((l) => ({ ...l, picked: [] }))
      },
      setTeams: (teams) => act({ type: "setTeams", teams }, (s) => ({ ...s, teams: teams.map((t) => ({ ...t, score: 0 })) })),
      bumpScore: (team, n) =>
        act({ type: "bump", team, n }, (s) => ({ ...s, teams: s.teams.map((t, i) => (i === team ? { ...t, score: t.score + n } : t)) })),
      resetScores: () => act({ type: "resetScores" }, (s) => ({ ...s, teams: s.teams.map((t) => ({ ...t, score: 0 })) })),
      addCard: (deck, text) =>
        act({ type: "addCard", deck, text }, (s) => ({ ...s, custom: { ...s.custom, [deck]: [...(s.custom[deck] ?? []), text] } })),
      markPicked: (name, reset) => setLocal((l) => ({ ...l, picked: [...(reset ? [] : l.picked), name] })),
      startVote: (prompt) =>
        act({ type: "startVote", prompt }, (s) => ({ ...s, vote: { id: "pending", prompt, status: "open" }, votes: {} })),
      castVote: (name) =>
        act({ type: "castVote", voteId, voter: local.deviceId, name }, (s) => ({ ...s, votes: { ...s.votes, [local.deviceId]: name } })),
      revealVote: () =>
        act({ type: "revealVote", voteId }, (s) => (s.vote ? { ...s, vote: { ...s.vote, status: "revealed" } } : s)),
      closeVote: () => act({ type: "closeVote", voteId }, (s) => ({ ...s, vote: null, votes: {} })),
      dismissVote: () => setLocal((l) => ({ ...l, dismissedVote: voteId })),
    }
  }, [shared, local, mode, names, act])

  return <PartyContext.Provider value={value}>{children}</PartyContext.Provider>
}

export function useParty() {
  const ctx = React.useContext(PartyContext)
  if (!ctx) throw new Error("useParty must be used inside PartyProvider")
  return ctx
}
