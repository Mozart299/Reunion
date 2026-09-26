# Back to Class 🎒

Party games for our high school reunion. No accounts, no TV needed.

- **With a database connected**, every phone that opens the link is live: teams, scores and added
  cards sync, and Most Likely To gets an **Everyone votes** button that pops a secret vote onto every phone.
- **Without one**, it runs on one phone and saves in that phone's browser.

- **Most Likely To**, **Never Have I Ever**, **Hot Seat**, **School Dares**: tap-through card decks
- **Guess It!**: a Heads Up-style 60-second round that adds points to a team
- **Teams**: paste names from the group chat and shuffle them into teams
- **Scores**: a running scoreboard for the whole day
- **Picker**: a random name spinner that gives everyone a turn before repeating anyone

Every deck has an "add a card" box, so you can add inside jokes before people arrive.

## Stack

Next.js (App Router), Tailwind v4, shadcn/ui (`components.json` is set up, so `npx shadcn add …` works),
with Bungee and Bricolage Grotesque fonts from Fontsource.

## Run

```bash
npm install
npm run dev
```

## Deploy

Import the repo on [vercel.com/new](https://vercel.com/new).

To turn on live sync: in the Vercel project go to **Storage → Create Database → Upstash for Redis**
(free plan), connect it to the project for all environments, and redeploy. The app reads
`KV_REST_API_URL` / `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`).
