import { applyAction, getState, getVersion, redis } from "@/lib/room-server"
import type { RoomAction, RoomResponse } from "@/lib/room-types"

export const dynamic = "force-dynamic"

const json = (body: RoomResponse, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } })

export async function GET(request: Request) {
  if (!redis) return json({ enabled: false })
  const known = new URL(request.url).searchParams.get("v")
  // Cheap poll: one Redis command when nothing has changed.
  if (known !== null) {
    const ver = await getVersion(redis)
    if (String(ver) === known) return json({ enabled: true, same: true, ver })
  }
  return json({ enabled: true, ...(await getState(redis)) })
}

export async function POST(request: Request) {
  if (!redis) return json({ enabled: false })
  let action: RoomAction
  try {
    action = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }
  await applyAction(redis, action)
  return json({ enabled: true, ...(await getState(redis)) })
}
