import "server-only"
import { Redis } from "@upstash/redis"
import { DECKS, EXAMPLE_NAMES, type DeckId } from "@/lib/content"
import type { RoomAction, SharedState, Vote } from "@/lib/room-types"

// Vercel's Upstash integration sets KV_REST_API_*; a direct Upstash setup uses UPSTASH_REDIS_REST_*.
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

export const redis = url && token ? new Redis({ url, token, automaticDeserialization: false }) : null

const K = {
  ver: "btc:ver",
  roster: "btc:roster",
  teams: "btc:teams",
  scores: "btc:scores",
  custom: "btc:custom",
  vote: "btc:vote",
  votes: (id: string) => `btc:votes:${id}`,
}

const DECK_IDS = new Set<string>(DECKS.map((d) => d.id))
const clip = (s: unknown, n: number) => (typeof s === "string" ? s.slice(0, n) : "")
const parse = <T,>(raw: unknown, fallback: T): T => {
  if (typeof raw !== "string") return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

/** HGETALL comes back as a flat [field, value, ...] array when auto-deserialization is off. */
const toRecord = (raw: unknown): Record<string, string> => {
  if (Array.isArray(raw)) {
    const out: Record<string, string> = {}
    for (let i = 0; i + 1 < raw.length; i += 2) out[String(raw[i])] = String(raw[i + 1])
    return out
  }
  return raw && typeof raw === "object" ? (raw as Record<string, string>) : {}
}

export async function getVersion(r: Redis): Promise<number> {
  return Number((await r.get<string>(K.ver)) ?? 0)
}

export async function getState(r: Redis): Promise<{ ver: number; state: SharedState }> {
  const [ver, roster, teams, scores, custom, voteRaw] = await r
    .pipeline()
    .get<string>(K.ver)
    .get<string>(K.roster)
    .get<string>(K.teams)
    .hgetall<Record<string, string>>(K.scores)
    .hgetall<Record<string, string>>(K.custom)
    .get<string>(K.vote)
    .exec()

  const vote = parse<Vote | null>(voteRaw, null)
  const votes = vote ? toRecord(await r.hgetall(K.votes(vote.id))) : {}

  const customByDeck: SharedState["custom"] = {}
  // Fields are "<deck>:<timestamp>-<rand>", so sorting keeps cards in the order they were added.
  for (const [field, text] of Object.entries(toRecord(custom)).sort(([a], [b]) => a.localeCompare(b))) {
    const deck = field.split(":")[0] as DeckId
    ;(customByDeck[deck] ??= []).push(text)
  }

  const s = toRecord(scores)
  return {
    ver: Number(ver ?? 0),
    state: {
      roster: typeof roster === "string" ? roster : EXAMPLE_NAMES.join("\n"),
      rosterIsExample: typeof roster !== "string",
      teams: parse<Omit<SharedState["teams"][number], "score">[]>(teams, []).map((t, i) => ({ ...t, score: Number(s[i] ?? 0) })),
      custom: customByDeck,
      vote,
      votes,
    },
  }
}

/** Applies one change. Returns false when the request is invalid or stale. */
export async function applyAction(r: Redis, a: RoomAction): Promise<boolean> {
  switch (a.type) {
    case "setRoster":
      await r.set(K.roster, clip(a.roster, 4000))
      break
    case "setTeams": {
      if (!Array.isArray(a.teams) || a.teams.length > 6) return false
      const teams = a.teams.map((t) => ({
        name: clip(t.name, 40),
        color: clip(t.color, 12),
        members: Array.isArray(t.members) ? t.members.slice(0, 60).map((m) => clip(m, 40)) : [],
      }))
      await r.pipeline().set(K.teams, JSON.stringify(teams)).del(K.scores).exec()
      break
    }
    case "bump":
      if (!Number.isInteger(a.team) || a.team < 0 || a.team > 5 || !Number.isInteger(a.n) || Math.abs(a.n) > 100) return false
      await r.hincrby(K.scores, String(a.team), a.n)
      break
    case "resetScores":
      await r.del(K.scores)
      break
    case "addCard": {
      const text = clip(a.text, 140).trim()
      if (!DECK_IDS.has(a.deck) || !text) return false
      await r.hset(K.custom, { [`${a.deck}:${Date.now()}-${Math.random().toString(36).slice(2, 6)}`]: text })
      break
    }
    case "startVote": {
      const prompt = clip(a.prompt, 200).trim()
      if (!prompt) return false
      const vote: Vote = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, prompt, status: "open" }
      await r.set(K.vote, JSON.stringify(vote))
      break
    }
    case "castVote": {
      const vote = parse<Vote | null>(await r.get<string>(K.vote), null)
      if (!vote || vote.id !== a.voteId || vote.status !== "open") return false
      const key = K.votes(vote.id)
      await r.pipeline().hset(key, { [clip(a.voter, 64)]: clip(a.name, 40) }).expire(key, 60 * 60 * 24).exec()
      break
    }
    case "revealVote":
    case "closeVote": {
      const vote = parse<Vote | null>(await r.get<string>(K.vote), null)
      if (!vote || vote.id !== a.voteId) return false
      if (a.type === "closeVote") await r.del(K.vote)
      else await r.set(K.vote, JSON.stringify({ ...vote, status: "revealed" }))
      break
    }
    default:
      return false
  }
  await r.incr(K.ver)
  return true
}
