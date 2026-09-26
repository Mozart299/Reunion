"use client"

import * as React from "react"
import { Crown, Eye, Vote as VoteIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParty } from "@/lib/store"
import { cn } from "@/lib/utils"

/** Pops up on every phone while a live Most Likely To vote is running. */
export function VoteSheet() {
  const { state, names, castVote, revealVote, closeVote, dismissVote } = useParty()
  const { vote, votes, deviceId, dismissedVote } = state
  if (!vote || vote.id === "pending" || vote.id === dismissedVote) return null

  const mine = votes[deviceId]
  const total = Object.keys(votes).length
  const tally = Object.values(votes).reduce<Record<string, number>>((acc, n) => ((acc[n] = (acc[n] ?? 0) + 1), acc), {})
  const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1])
  const top = ranked[0]?.[1] ?? 0
  const winners = ranked.filter(([, n]) => n === top).map(([name]) => name)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 backdrop-blur-sm sm:items-center">
      <div className="card-in flex max-h-[92dvh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-t-3xl border-4 border-ink bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-hard-lg sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xs tracking-widest text-cyan">
              {vote.status === "open" ? "Live vote · everyone's phone" : "The class has spoken"}
            </p>
            <p className="font-display text-sm text-sun">Who&apos;s most likely to…</p>
            <h2 className="text-balance text-2xl font-extrabold leading-tight">{vote.prompt}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={dismissVote} aria-label="Hide this vote on my phone">
            <X />
          </Button>
        </div>

        {vote.status === "open" && !mine && (
          <>
            <p className="text-sm text-muted-foreground">Tap one name. Votes stay secret until the reveal.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {names.map((n) => (
                <Button key={n} variant="outline" className="h-12 whitespace-normal text-base leading-tight" onClick={() => castVote(n)}>
                  {n}
                </Button>
              ))}
            </div>
          </>
        )}

        {vote.status === "open" && mine && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <VoteIcon className="size-10 text-lime" />
            <p className="text-lg font-bold">You voted <span className="text-lime">{mine}</span></p>
            <p className="font-display text-5xl text-sun sticker-text tabular-nums">{total}</p>
            <p className="text-sm text-muted-foreground">{total === 1 ? "vote" : "votes"} in so far</p>
          </div>
        )}

        {vote.status === "revealed" && (
          <div className="flex flex-col gap-3">
            {winners.length > 0 ? (
              <div className="flex flex-col items-center gap-1 rounded-2xl border-4 border-ink bg-pink p-5 text-center shadow-hard">
                <Crown className="wobble size-8 text-sun" />
                <span className="font-display text-4xl leading-tight text-sun sticker-text">{winners.join(" & ")}</span>
                <span className="text-sm font-bold text-white">{top} of {total} votes</span>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Nobody voted.</p>
            )}
            <div className="flex flex-col gap-2">
              {ranked.map(([name, n]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate font-semibold">{name}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded-full border-2 border-ink bg-muted">
                    <div
                      className={cn("h-full rounded-full", n === top ? "bg-sun" : "bg-lilac")}
                      style={{ width: `${(n / Math.max(1, total)) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-display tabular-nums">{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {vote.status === "open" ? (
            <Button size="lg" variant="secondary" className="flex-1" onClick={revealVote} disabled={total === 0}>
              <Eye /> Reveal results
            </Button>
          ) : (
            <Button size="lg" variant="secondary" className="flex-1" onClick={closeVote}>
              Done, end vote for everyone
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
