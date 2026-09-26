"use client"

import * as React from "react"
import { Shuffle, Dices, Vote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddCard } from "@/components/party/add-card"
import { useParty } from "@/lib/store"
import { BG, BORDER, TEXT, shuffle, type Deck } from "@/lib/content"
import { cn } from "@/lib/utils"

export function DeckPlayer({ deck, onPickSomeone }: { deck: Deck; onPickSomeone: () => void }) {
  const { state, mode, names, startVote } = useParty()
  const all = React.useCallback(() => deck.cards.concat(state.custom[deck.id] ?? []), [deck, state.custom])
  const [order, setOrder] = React.useState(() => shuffle(all()))
  const [i, setI] = React.useState(0)
  const [reshuffled, setReshuffled] = React.useState(false)

  const next = () => {
    if (i + 1 >= order.length) {
      setOrder(shuffle(all()))
      setI(0)
      setReshuffled(true)
    } else {
      setI(i + 1)
      setReshuffled(false)
    }
  }

  const canPick = deck.id === "hot" || deck.id === "dare"
  const canVote = deck.id === "mlt" && mode === "live" && names.length > 1

  return (
    <div className="flex flex-1 flex-col gap-5">
      <button
        key={`${i}-${order[i]}`}
        onClick={next}
        aria-label="Next card"
        className={cn(
          "card-in relative flex min-h-72 flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-4 border-ink p-6 text-center shadow-hard-lg",
          BG[deck.color], "text-ink"
        )}
      >
        <span className="absolute left-4 top-3 font-display text-xs tracking-widest opacity-70">
          {i + 1} / {order.length}
        </span>
        <span className="font-display text-lg">{deck.lead}</span>
        <span className="text-balance text-3xl font-extrabold leading-tight sm:text-4xl">{order[i]}</span>
        <span className="text-sm font-semibold opacity-70">
          {reshuffled ? "That was every card. Fresh deck shuffled." : "Tap the card for the next one"}
        </span>
      </button>

      <div className="flex flex-wrap gap-3">
        {canPick && (
          <Button size="lg" variant="outline" className={cn("flex-1", BORDER[deck.color], TEXT[deck.color])} onClick={onPickSomeone}>
            <Dices /> Pick someone
          </Button>
        )}
        {canVote && (
          <Button size="lg" className="flex-1" onClick={() => startVote(order[i])}>
            <Vote /> Everyone votes
          </Button>
        )}
        <Button size="lg" variant="secondary" className="flex-1" onClick={next}>
          <Shuffle /> Next card
        </Button>
      </div>

      <AddCard
        deckId={deck.id}
        onAdded={(t) => setOrder((o) => [...o.slice(0, i + 1), t, ...o.slice(i + 1)])}
      />
    </div>
  )
}
