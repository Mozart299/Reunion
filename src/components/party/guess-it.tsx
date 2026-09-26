"use client"

import * as React from "react"
import { Check, X, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddCard } from "@/components/party/add-card"
import { useParty } from "@/lib/store"
import { BG, BORDER, ROUND_SECONDS, TEXT, shuffle, type Deck } from "@/lib/content"
import { cn } from "@/lib/utils"

type Phase =
  | { kind: "intro" }
  | { kind: "countdown"; n: number }
  | { kind: "playing" }
  | { kind: "done" }

export function GuessIt({ deck }: { deck: Deck }) {
  const { state, bumpScore } = useParty()
  const [phase, setPhase] = React.useState<Phase>({ kind: "intro" })
  const [team, setTeam] = React.useState<number | null>(null)
  const [left, setLeft] = React.useState(ROUND_SECONDS)
  const [got, setGot] = React.useState<string[]>([])
  const [passed, setPassed] = React.useState<string[]>([])
  const deckRef = React.useRef<{ order: string[]; i: number }>({ order: [], i: 0 })
  const [word, setWord] = React.useState("")

  const drawWord = React.useCallback(() => {
    const d = deckRef.current
    if (d.i >= d.order.length) {
      d.order = shuffle(deck.cards.concat(state.custom[deck.id] ?? []))
      d.i = 0
    }
    setWord(d.order[d.i++])
  }, [deck, state.custom])

  // 3-2-1 countdown
  React.useEffect(() => {
    if (phase.kind !== "countdown") return
    const t = setTimeout(() => {
      if (phase.n > 1) setPhase({ kind: "countdown", n: phase.n - 1 })
      else {
        setGot([]); setPassed([]); setLeft(ROUND_SECONDS); drawWord(); setPhase({ kind: "playing" })
      }
    }, 800)
    return () => clearTimeout(t)
  }, [phase, drawWord])

  // Round clock
  React.useEffect(() => {
    if (phase.kind !== "playing") return
    const t = setTimeout(() => {
      if (left > 1) return setLeft(left - 1)
      setLeft(0)
      setPhase({ kind: "done" })
      if (team != null) {
        bumpScore(team, got.length)
      }
    }, 1000)
    return () => clearTimeout(t)
  }, [phase, left, team, got.length, bumpScore])

  const start = (teamIdx: number | null) => { setTeam(teamIdx); setPhase({ kind: "countdown", n: 3 }) }
  const teamObj = team != null ? state.teams[team] : null

  if (phase.kind === "intro") {
    return (
      <div className="flex flex-1 flex-col gap-5">
        <div className={cn("card-in flex flex-col items-center gap-3 rounded-2xl border-4 border-ink p-6 text-center shadow-hard-lg", BG[deck.color], "text-ink")}>
          <span className="font-display text-sm tracking-widest">How to play</span>
          <p className="text-balance text-2xl font-extrabold leading-tight">Hold the phone on your forehead, screen facing your team.</p>
          <p className="text-sm font-semibold opacity-80">Your team shouts clues without saying the word. Tap ✓ or ✗. {ROUND_SECONDS} seconds a round.</p>
        </div>
        {state.teams.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Whose turn? Points go to that team</p>
            <div className="grid grid-cols-2 gap-2">
              {state.teams.map((t, idx) => (
                <Button key={t.name} variant="outline" className={cn(BORDER[t.color], TEXT[t.color])} onClick={() => start(idx)}>
                  {t.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        <Button size="lg" variant={state.teams.length ? "outline" : "secondary"} onClick={() => start(null)}>
          <Play /> {state.teams.length ? "Play without scoring" : "Start round"}
        </Button>
        <AddCard deckId={deck.id} onAdded={(t) => deckRef.current.order.splice(deckRef.current.i, 0, t)} />
      </div>
    )
  }

  if (phase.kind === "countdown") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <span className="font-display text-xl text-muted-foreground">Phone on forehead!</span>
        <span key={phase.n} className={cn("card-in font-display text-[9rem] leading-none sticker-text", TEXT[deck.color])}>{phase.n}</span>
      </div>
    )
  }

  if (phase.kind === "playing") {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className={cn("font-display text-center text-5xl tabular-nums sticker-text", left <= 10 ? "text-pink" : "text-sun")}>{left}s</div>
        <div key={word} className={cn("card-in flex flex-1 items-center justify-center rounded-2xl border-4 border-ink p-6 text-center shadow-hard-lg", BG[deck.color], "text-ink")}>
          <span className="text-balance font-display text-5xl leading-tight sm:text-6xl">{word}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" variant="destructive" className="h-20 text-xl" onClick={() => { setPassed((p) => [...p, word]); drawWord() }}>
            <X strokeWidth={3} /> Pass
          </Button>
          <Button size="lg" className="h-20 bg-lime text-xl text-ink" onClick={() => { setGot((g) => [...g, word]); drawWord() }}>
            <Check strokeWidth={3} /> Got it
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="card-in flex flex-col items-center gap-3 rounded-2xl border-4 border-ink bg-card p-6 text-center shadow-hard-lg">
        <span className="font-display text-lg text-muted-foreground">Time&apos;s up!</span>
        <span className={cn("font-display text-6xl sticker-text", TEXT[deck.color])}>{got.length}</span>
        <span className="font-bold">correct</span>
        {teamObj && (
          <span className={cn("font-bold", TEXT[teamObj.color])}>+{got.length} to {teamObj.name} (now {teamObj.score})</span>
        )}
        {got.length > 0 && <p className="text-sm text-muted-foreground"><b className="text-lime">Got:</b> {got.join(", ")}</p>}
        {passed.length > 0 && <p className="text-sm text-muted-foreground"><b className="text-pink">Passed:</b> {passed.join(", ")}</p>}
      </div>
      <Button size="lg" variant="secondary" onClick={() => setPhase({ kind: "intro" })}>
        <RotateCcw /> Next round
      </Button>
    </div>
  )
}
