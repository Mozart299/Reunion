"use client"

import * as React from "react"
import { EXAMPLE_NAMES, type DeckId } from "@/lib/content"

export type Team = { name: string; color: string; members: string[]; score: number }

export type PartyState = {
  roster: string
  rosterIsExample: boolean
  teams: Team[]
  custom: Partial<Record<DeckId, string[]>>
  picked: string[]
}

const KEY = "back-to-class-v1"
const fresh = (): PartyState => ({
  roster: EXAMPLE_NAMES.join("\n"),
  rosterIsExample: true,
  teams: [],
  custom: {},
  picked: [],
})

type Ctx = {
  state: PartyState
  update: (fn: (s: PartyState) => PartyState) => void
  names: string[]
}

const PartyContext = React.createContext<Ctx | null>(null)

export function PartyProvider({ children }: { children: React.ReactNode }) {
  // Everything lives on this phone only. The app renders client-side, so
  // localStorage is safe to read in the initialiser.
  const [state, setState] = React.useState<PartyState>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) return { ...fresh(), ...JSON.parse(raw) }
    } catch {}
    return fresh()
  })

  React.useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  const names = React.useMemo(
    () => state.roster.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean),
    [state.roster]
  )

  const value = React.useMemo(() => ({ state, update: setState, names }), [state, names])
  return <PartyContext.Provider value={value}>{children}</PartyContext.Provider>
}

export function useParty() {
  const ctx = React.useContext(PartyContext)
  if (!ctx) throw new Error("useParty must be used inside PartyProvider")
  return ctx
}
