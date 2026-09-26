"use client"

import * as React from "react"
import { Crown, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useParty } from "@/lib/store"
import { BORDER, TEXT } from "@/lib/content"
import { cn } from "@/lib/utils"

export function Scores({ onMakeTeams }: { onMakeTeams: () => void }) {
  const { state, bumpScore, resetScores } = useParty()
  const [armed, setArmed] = React.useState(false)

  React.useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 4000)
    return () => clearTimeout(t)
  }, [armed])

  const header = (
    <div>
      <h2 className="font-display text-3xl text-sun sticker-text">Scoreboard</h2>
      <p className="text-muted-foreground">Points across every game today.</p>
    </div>
  )

  if (!state.teams.length) {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
          No teams yet.
          <Button onClick={onMakeTeams}><Users /> Make teams</Button>
        </div>
      </div>
    )
  }

  const top = Math.max(...state.teams.map((t) => t.score))
  const sorted = state.teams.map((t, i) => ({ t, i })).sort((a, b) => b.t.score - a.t.score)
  const bump = bumpScore

  return (
    <div className="flex flex-col gap-4">
      {header}
      {sorted.map(({ t, i }) => (
        <Card key={t.name} className={cn("gap-3 py-4", t.score === top && top > 0 && BORDER[t.color])}>
          <div className="flex items-start justify-between gap-3 px-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("font-display text-xl leading-tight", TEXT[t.color])}>{t.name}</span>
                {t.score === top && top > 0 && (
                  <Badge variant="secondary" className="wobble"><Crown /> Leading</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{t.members.join(", ")}</p>
            </div>
            <span className={cn("font-display text-5xl tabular-nums leading-none sticker-text", TEXT[t.color])}>{t.score}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 px-5">
            <Button variant="outline" onClick={() => bump(i, -1)} aria-label={`Take 1 point from ${t.name}`}>−1</Button>
            <Button variant="outline" onClick={() => bump(i, 1)} aria-label={`Give 1 point to ${t.name}`}>+1</Button>
            <Button variant="outline" onClick={() => bump(i, 3)} aria-label={`Give 3 points to ${t.name}`}>+3</Button>
            <Button variant="outline" onClick={() => bump(i, 5)} aria-label={`Give 5 points to ${t.name}`}>+5</Button>
          </div>
        </Card>
      ))}
      <div className="flex gap-2">
        {armed ? (
          <Button variant="destructive" size="sm" onClick={() => { resetScores(); setArmed(false) }}>
            Tap again to reset every score to 0
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setArmed(true)}>Reset scores</Button>
        )}
      </div>
    </div>
  )
}
