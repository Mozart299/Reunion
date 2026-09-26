"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useParty } from "@/lib/store"
import type { DeckId } from "@/lib/content"

export function AddCard({ deckId, onAdded }: { deckId: DeckId; onAdded: (text: string) => void }) {
  const { state, update } = useParty()
  const [text, setText] = React.useState("")
  const mine = state.custom[deckId]?.length ?? 0

  return (
    <div className="flex flex-col gap-1.5">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const t = text.trim()
          if (!t) return
          update((s) => ({ ...s, custom: { ...s.custom, [deckId]: [...(s.custom[deckId] ?? []), t] } }))
          onAdded(t)
          setText("")
          toast.success("Added. It's coming up next.")
        }}
      >
        <Input
          id={`add-${deckId}`}
          value={text}
          maxLength={140}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add an inside joke, a teacher, a moment…"
          aria-label="Add your own card"
        />
        <Button type="submit" variant="secondary" size="icon" aria-label="Add card">
          <Plus strokeWidth={3} />
        </Button>
      </form>
      <p className="text-center text-xs text-muted-foreground">
        {mine ? `${mine} of your own cards in this game` : "Your cards are saved on this phone."}
      </p>
    </div>
  )
}
