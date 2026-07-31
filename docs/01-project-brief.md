# Diskette: project brief

## What it is

A website that turns a list of favourite media into a shelf of physical objects. Each entry on a list is not a poster thumbnail. It is a DVD case, a jewel case, a game case. You can open it, take the disc out, and spin it.

Four media types in phase one: films, series, albums, games.

## Why this rather than another list site

Letterboxd, Backloggd, Musicboard and Topsters already handle ranking. They render everything as a flat grid of cover art. Delicious Library did 3D shelves on Mac from 2004 until Amazon revoked its data access in 2019. BigBoxCollection and BigBoxDB render 3D PC game boxes, but they are one collector's archive rather than a tool.

Nobody has combined openable cases, a disc that comes out and spins, and cross-medium ranking. That is the gap.

The interaction is the point. If the objects do not feel good to handle, the project has failed, regardless of how complete the lists are.

## Scope

### Phase one: my collection

- One all-time top 10 per medium. Forty objects total.
- Each object opens and reveals its disc.
- Assets fetched once, processed, committed to the repo. No runtime API calls.
- Desktop and mobile.
- Deployed on a static host.

Done when: I can send someone a link, they can open all forty objects on a phone without anything stuttering, and I am not embarrassed by any of them.

### Phase two: genres

- Multiple lists per medium, organised by genre.
- Navigation between lists.
- List ordering becomes something I edit rather than hardcode.

### Phase three: other people

- Anyone can build lists.
- Requires accounts, a database, a search-and-add flow, and runtime asset fetching.
- Requires resolving the licensing question in `02-asset-sources.md`.

Do not build for phase three during phase one. The data shape should not block it, and that is the only concession phase one makes.

## Object model

```
Entry
  id
  title
  year
  medium         film | series | album | game
  creator        director | showrunner | artist | studio
  rank
  list           "all-time" for now
  case           the physical format the entry ships in
  cover          front artwork
  spine          spine artwork, optional
  back           back artwork, optional
  disc           retail scan, generated, or burned
  discSource     retail | generated | burned
  note           one or two sentences, my own words, why it is on the list
```

`note` matters more than it looks. Forty objects with no writing is a tech demo. Forty objects each with two honest sentences is a personal site.

## Open decisions

These need answers before or during the first build. I do not have to answer them now.

1. **Case format per entry.** A film I know from a DVD and a film I know from a 4K Blu-ray are different objects. Do I pick the format I actually owned, or the canonical release? Picking what I owned is more personal and harder to justify to a stranger.
2. **Series.** A season is a multi-disc box set. Does the case open to a stack of discs, or does one disc represent the whole thing?
3. **Games with no disc.** A game I only ever played on Steam has no physical release in my hands. Burned disc, generated disc, or a cartridge for the platform it belongs to?
4. **Shelf or single object.** Does the list appear as a row of spines you pull from, like the Mint reference, or as one object at a time that you page through? The spine row is more evocative and much harder on mobile.
5. **Ranking display.** Is the rank visible as a number, implied by position, or hidden until you look for it?

## Reference points

- `play.mint.gg/complete-shelf` — pull an object forward from a shelf, orbit it, inspect it.
- `press.stripe.com` — the "living cover" treatment, an object rendered with enough material fidelity that it reads as a real thing.
- BigBoxCollection — 3D box models with scanned contents underneath.
- Delicious Library — the precedent, and the warning about depending on one data source.
