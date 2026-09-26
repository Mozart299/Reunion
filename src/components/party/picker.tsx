"use client"

import * as React from "react"
import { Dices } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useParty } from "@/lib/store"
import { cn } from "@/lib/utils"

export function Picker({ autoPick, onAutoPicked }: { autoPick: boolean; onAutoPicked: () => void }) {
  const { state, markPicked, names } = useParty()
  const [noRepeat, setNoRepeat] = React.useState(true)
  const [shown, setShown] = React.useState<string | null>(null)
  const [spinning, setSpinning] = React.useState(false)
  const [landed, setLanded] = React.useState(0)

  const pick = React.useCallback(() => {
    if (spinning || !names.length) return
    let pool = noRepeat ? names.filter((n) => !state.picked.includes(n)) : names
    let resetPicked = false
    if (!pool.length) { pool = names; resetPicked = true }
    const chosen = pool[Math.floor(Math.random() * pool.length)]
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const total = reduce ? 1 : 18
    let tick = 0
    setSpinning(true)
    const step = () => {
      tick++
      if (tick >= total) {
        setShown(chosen)
        setLanded((x) => x + 1)
        setSpinning(false)
        if (noRepeat) markPicked(chosen, resetPicked)
        return
      }
      setShown(names[Math.floor(Math.random() * names.length)])
      setTimeout(step, 45 + tick * 12)
    }
    step()
  }, [spinning, names, noRepeat, state.picked, markPicked])

  React.useEffect(() => {
    if (!autoPick) return
    const t = setTimeout(() => { onAutoPicked(); pick() }, 250)
    return () => clearTimeout(t)
  }, [autoPick, onAutoPicked, pick])

  const waiting = names.filter((n) => !state.picked.includes(n)).length

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl text-sun sticker-text">Who&apos;s next?</h2>
        <p className="text-muted-foreground">Random pick from your names list. Hot seat, dares, or who buys the next round.</p>
      </div>

      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border-4 border-ink bg-pink p-6 text-center text-white shadow-hard-lg">
        <span className="font-display text-sm tracking-widest opacity-90">The spotlight lands on…</span>
        <span
          key={spinning ? "spin" : landed}
          className={cn("font-display text-5xl leading-tight sm:text-6xl sticker-text text-sun break-words max-w-full", !spinning && shown && "card-in")}
        >
          {shown ?? "?"}
        </span>
        <span className="text-sm font-semibold opacity-90">
          {!names.length
            ? "Add names in the Teams tab first."
            : noRepeat
              ? `${waiting} of ${names.length} still waiting for a turn`
              : `${names.length} names in the hat`}
        </span>
      </div>

      <Button size="lg" variant="secondary" className="h-16 text-xl" onClick={pick} disabled={spinning || !names.length}>
        <Dices /> {spinning ? "Spinning…" : "Pick someone"}
      </Button>

      <label className="flex items-center gap-3 text-muted-foreground" htmlFor="no-repeat">
        <Checkbox id="no-repeat" checked={noRepeat} onCheckedChange={(v) => setNoRepeat(v === true)} />
        Don&apos;t pick the same person twice until everyone has had a turn
      </label>
    </div>
  )
}
