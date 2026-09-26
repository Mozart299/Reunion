"use client"

import dynamic from "next/dynamic"

// The whole app lives in this phone's localStorage, so skip server rendering.
const PartyApp = dynamic(() => import("@/components/party/party-app"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center">
      <span className="font-display text-4xl text-pink sticker-text -rotate-2">Back to Class</span>
    </div>
  ),
})

export function ClientPartyApp() {
  return <PartyApp />
}
