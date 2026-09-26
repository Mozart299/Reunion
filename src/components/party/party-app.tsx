"use client"

import * as React from "react"
import { ArrowLeft, Dices, Gamepad2, Radio, Smartphone, Trophy, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeckPlayer } from "@/components/party/deck-player"
import { GuessIt } from "@/components/party/guess-it"
import { Teams } from "@/components/party/teams"
import { Scores } from "@/components/party/scores"
import { Picker } from "@/components/party/picker"
import { VoteSheet } from "@/components/party/vote-sheet"
import { PartyProvider, useParty } from "@/lib/store"
import { BG, DECKS, TEXT, type Deck } from "@/lib/content"
import { cn } from "@/lib/utils"

type Tab = "games" | "teams" | "scores" | "pick"

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "teams", label: "Teams", icon: Users },
  { id: "scores", label: "Scores", icon: Trophy },
  { id: "pick", label: "Picker", icon: Dices },
]

export default function PartyApp() {
  return (
    <PartyProvider>
      <Shell />
      <VoteSheet />
    </PartyProvider>
  )
}

function useWakeLock(on: boolean) {
  React.useEffect(() => {
    if (!on) return
    let lock: WakeLockSentinel | undefined
    navigator.wakeLock?.request("screen").then((l) => (lock = l)).catch(() => {})
    return () => { lock?.release().catch(() => {}) }
  }, [on])
}

function Shell() {
  const [tab, setTab] = React.useState<Tab>("games")
  const [deck, setDeck] = React.useState<Deck | null>(null)
  const [autoPick, setAutoPick] = React.useState(false)
  const clearAutoPick = React.useCallback(() => setAutoPick(false), [])
  useWakeLock(deck !== null)

  if (deck) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setDeck(null)} aria-label="Back to games">
            <ArrowLeft />
          </Button>
          <h1 className={cn("truncate font-display text-2xl sticker-text", TEXT[deck.color])}>{deck.name}</h1>
        </div>
        {deck.timed ? (
          <GuessIt deck={deck} />
        ) : (
          <DeckPlayer
            key={deck.id}
            deck={deck}
            onPickSomeone={() => { setDeck(null); setTab("pick"); setAutoPick(true) }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-xl items-end justify-between gap-3 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="leading-none">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan">The reunion edition</p>
          <h1 className="font-display text-4xl text-pink sticker-text -rotate-2 origin-left">Back to Class</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Today />
          <SyncBadge />
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 overflow-y-auto px-4 pb-6 pt-2">
        {tab === "games" && <Games onOpen={setDeck} />}
        {tab === "teams" && <Teams onGoToScores={() => setTab("scores")} />}
        {tab === "scores" && <Scores onMakeTeams={() => setTab("teams")} />}
        {tab === "pick" && <Picker autoPick={autoPick} onAutoPicked={clearAutoPick} />}
      </main>

      <nav
        role="tablist"
        className="sticky bottom-0 grid grid-cols-4 border-t-4 border-ink pb-[env(safe-area-inset-bottom)]"
        style={{ background: "var(--grape-2)" }}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors",
              tab === id ? "text-sun" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("size-6", tab === id && "drop-shadow-[2px_2px_0_var(--ink)]")} strokeWidth={2.5} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function SyncBadge() {
  const { mode } = useParty()
  if (mode === "connecting") return null
  return mode === "live" ? (
    <span className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-widest text-lime">
      <Radio className="size-3.5 animate-pulse" /> Live on every phone
    </span>
  ) : (
    <span className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
      <Smartphone className="size-3.5" /> This phone only
    </span>
  )
}

function Today() {
  const d = new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
  return (
    <span className="rotate-3 whitespace-nowrap rounded-md border-2 border-ink bg-sun px-2 py-1 font-display text-xs text-ink shadow-hard">
      {d}
    </span>
  )
}

function Games({ onOpen }: { onOpen: (d: Deck) => void }) {
  const { state, mode } = useParty()
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">{mode === "live"
          ? "Everyone's phone is connected. Teams, scores and your added cards update for all. On Most Likely To, tap \"Everyone votes\"."
          : "Everything runs on this one phone. Read the card out loud or pass the phone around."}</p>
      <div className="grid grid-cols-2 gap-3">
        {DECKS.map((d, i) => {
          const mine = state.custom[d.id]?.length ?? 0
          return (
            <button
              key={d.id}
              onClick={() => onOpen(d)}
              className={cn(
                "group flex flex-col gap-2 rounded-xl border-2 border-ink p-4 text-left text-ink shadow-hard transition-transform hover:-translate-y-1 active:translate-y-0.5 active:shadow-none",
                BG[d.color],
                d.timed ? "col-span-2" : "min-h-40",
                i % 2 ? "rotate-[0.8deg]" : "-rotate-[0.8deg]"
              )}
            >
              <span className="font-display text-lg leading-tight">{d.name}</span>
              <span className="flex-1 text-sm font-medium leading-snug opacity-85">{d.how}</span>
              <span className="text-[0.7rem] font-bold uppercase tracking-widest opacity-70">
                {d.cards.length + mine} cards{mine ? ` · ${mine} yours` : ""}
              </span>
            </button>
          )
        })}
      </div>
      <div className="rounded-xl border-2 border-dashed border-lilac/60 p-4 text-sm text-muted-foreground">
        <b className="text-lilac">Make it yours:</b> every game has an add box. Before people arrive, add inside jokes, teachers&apos; names and legendary school moments. They get shuffled in with the rest.
      </div>
    </div>
  )
}
