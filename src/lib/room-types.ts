import type { DeckId } from "@/lib/content"

export type Team = { name: string; color: string; members: string[]; score: number }

export type Vote = { id: string; prompt: string; status: "open" | "revealed" }

/** Everything every phone should see the same way. */
export type SharedState = {
  roster: string
  rosterIsExample: boolean
  teams: Team[]
  custom: Partial<Record<DeckId, string[]>>
  vote: Vote | null
  /** voter device id -> name they voted for */
  votes: Record<string, string>
}

export type RoomResponse =
  | { enabled: false }
  | { enabled: true; same: true; ver: number }
  | { enabled: true; same?: false; ver: number; state: SharedState }

export type RoomAction =
  | { type: "setRoster"; roster: string }
  | { type: "setTeams"; teams: Omit<Team, "score">[] }
  | { type: "bump"; team: number; n: number }
  | { type: "resetScores" }
  | { type: "addCard"; deck: DeckId; text: string }
  | { type: "startVote"; prompt: string }
  | { type: "castVote"; voteId: string; voter: string; name: string }
  | { type: "revealVote"; voteId: string }
  | { type: "closeVote"; voteId: string }
