# BarHopoly

A bar-crawl board game for phones. The group walks a real loop of bars together; each turn one roll moves
everyone, and whoever's turn it is can claim the bar they land on by finishing its drinking challenge.

## How it runs

- `public/` is the site: `index.html` (the game) and `standalone.js` (live sync + anonymous player ids).
- `src/worker.js` is the Cloudflare Worker. Each hosted game gets its own live room (a Durable Object)
  keyed by its 4-letter code; the boards live in one more room. `src/seed.js` holds the starting boards.
- `wrangler.toml` tells Cloudflare how to deploy it.

Pushing to the `main` branch on GitHub redeploys automatically through Cloudflare.

## Changing the game

`crawl-board.html` is the source for the game page. After editing it, rebuild the site page and push:

```
powershell -File build.ps1
git add -A
git commit -m "Describe the change"
git push
```

## Editing boards

Open the site with `#edit` on the end of the address. Saving needs the admin key: set a secret called
`ADMIN_KEY` in Cloudflare (Workers & Pages → barhopoly → Settings → Variables and Secrets). The game asks for
it the first time you save and remembers it on that phone.
