"use client"

import * as React from "react"
import { Shuffle, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useParty } from "@/lib/store"
import { BORDER, TEAM_STYLES, TEXT, shuffle } from "@/lib/content"
import { cn } from "@/lib/utils"

export function Teams({ onGoToScores }: { onGoToScores: () => void }) {
  const { state, update, names } = useParty()
  const [count, setCount] = React.useState(3)

  const makeTeams = () => {
    const people = shuffle(names)
    const k = Math.max(1, Math.min(count, people.length))
    const styles = shuffle(TEAM_STYLES).slice(0, k)
    const teams = styles.map((s) => ({ name: s.name, color: s.color, members: [] as string[], score: 0 }))
    people.forEach((p, i) => teams[i % k].members.push(p))
    update((s) => ({ ...s, teams }))
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-3xl text-sun sticker-text">Make teams</h2>
        <p className="text-muted-foreground">Paste names from the group chat, one per line or separated by commas.</p>
      </div>

      {state.rosterIsExample && (
        <p className="text-sm font-semibold text-sun">These are example names. Replace them with your crew.</p>
      )}
      <Textarea
        id="roster"
        aria-label="Names"
        className="min-h-40"
        value={state.roster}
        onFocus={(e) => state.rosterIsExample && e.currentTarget.select()}
        onChange={(e) => update((s) => ({ ...s, roster: e.target.value, rosterIsExample: false, picked: [] }))}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Teams</span>
        {[2, 3, 4, 5, 6].map((n) => (
          <Button
            key={n}
            size="icon"
            variant={count === n ? "secondary" : "outline"}
            onClick={() => setCount(n)}
            aria-pressed={count === n}
          >
            {n}
          </Button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">{names.length} people</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={makeTeams} disabled={!names.length} className="flex-1">
          <Shuffle /> Shuffle into teams
        </Button>
        {state.teams.length > 0 && (
          <Button size="lg" variant="outline" onClick={onGoToScores}>
            <Trophy /> Scores
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {state.teams.map((t, i) => (
          <Card key={t.name} className={cn("card-in gap-2 py-4", i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]")}>
            <CardHeader>
              <CardTitle className={cn("text-xl", TEXT[t.color])}>{t.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {t.members.map((m) => (
                  <span key={m} className={cn("rounded-full border-2 px-2.5 py-0.5 text-sm font-semibold", BORDER[t.color])}>{m}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
