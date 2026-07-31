# Build plan

Phase one, start to deploy. The order follows the build order in `03-object-spec.md`. Step 1 decides whether this is a CSS project or a Three.js project, and every step after it depends on that answer.

Content is done. Forty entries are in `src/data/lists.ts`. Notes are not written, which is the only thing still blocking step 6.

## Repo layout

```
diskette/
  CLAUDE.md
  docs/
    01-project-brief.md
    02-asset-sources.md
    03-object-spec.md
    04-lists.md
    05-build-plan.md
  src/
    components/
    data/lists.ts
  scripts/
    fetch-assets.ts
  assets-raw/          downloads, gitignored
  public/assets/       processed, committed
  credits.json
  .env                 API keys, gitignored
```

## Setup

Run in the empty folder.

```bash
cd ~/Desktop/diskette
npm create vite@latest . -- --template react-ts
npm install
git init && git add -A && git commit -m "Scaffold Vite React TS"
mkdir -p docs assets-raw scripts src/data src/components public/assets
```

Put `CLAUDE.md` at the root, the five markdown files in `docs/`, and `lists.ts` in `src/data/`. Then:

```bash
npm install @fontsource/permanent-marker
npm install -D sharp tsx
printf "assets-raw/\n.env\n" >> .gitignore
git add -A && git commit -m "Add docs, lists, fonts and asset tooling"
```

Dev server, left running in its own terminal tab:

```bash
npm run dev
```

Serves on `localhost:5173`. Run `claude` in a second tab from the repo root.

Do not run `/init`. It scans the scaffold and writes a generic `CLAUDE.md` over the real one. Run `/memory` instead to confirm the file loaded.

Commit after every step.

## Step 0: add the case rows to the object spec

`03-object-spec.md` has four case formats. The lists need five, plus livery. Add to the table:

| Format | H x W x D (mm) | Front face ratio (w/h) | Used for |
|---|---|---|---|
| PS5 case (?) | 148 x 135 x 14 | 0.912 | PS5 games |

Then add a livery section: `standard`, `ps2` black body, `ps3` black body with the platform band, `ps4` blue body, `ps5` white body with a blue band. Livery is colour over existing geometry, not a new shape.

Verify the PS5 figures against a real case. The question mark stays until you do.

## Step 1: one disc, spinning

Download one transparent disc PNG for The Dark Knight by hand from fanart.tv. Free key, registration required, attribution required in the colophon. Use the `/preview` 200px URL while prototyping. Save it to `public/assets/film/the-dark-knight/disc.png`.

Prompt:

```
Build a single spinning disc component in src/components/Disc.tsx.

Use the retail disc PNG at public/assets/film/the-dark-knight/disc.png.

Geometry from docs/03-object-spec.md: 120mm diameter, 15mm centre hole,
clear polycarbonate ring from the hole out to 46mm. Comment each ratio with
its millimetre source. Do not fill the clear ring.

Add the specular sweep from that doc: a low-opacity conic gradient rotating
on its own timing, offset from the disc rotation so the highlight travels
across the artwork rather than with it.

Rotation is 4 to 8 seconds per turn. It must not blur.

prefers-reduced-motion stops the rotation entirely.

CSS only. If you conclude CSS cannot produce a convincing specular sweep
here, stop and tell me why before writing any Three.js.
```

Check it on a real phone before moving on. If the answer is Three.js, that changes steps 3 and 6, and the decision belongs here.

## Step 2: burned disc generator

Five entries use it: The Life of Pablo, Rocket League, Cuphead, and whatever falls through the ladder in step 5. Self-contained, no data dependency.

Prompt:

```
Build src/components/BurnedDisc.tsx. Props: title, year, medium, optional
secondLine. It renders a blank recordable disc.

Follow the burned disc section of docs/03-object-spec.md exactly. CD-R
cyan-green for albums, DVD-R violet-blue for everything else. Specular sweep
at higher intensity than a printed disc. A faint low-contrast manufacturer
ring near the hub. Title in marker across the middle rather than around the
curve. Rotation 2 to 5 degrees, slight vertical offset.

Permanent Marker via @fontsource/permanent-marker, self-hosted. Caps for
films and games, mixed case for albums. Ink near-black with a blue cast at
90% opacity.

Render the three entries in src/data/lists.ts that have discSource set to
burned, side by side, so I can see a CD-R and two DVD-Rs together.
```

The manufacturer ring near the hub is what sells it. A clean blank reads as a rendering error.

## Step 3: one case, opening

Prompt:

```
Build src/components/Case.tsx wrapping the Disc component.

Blu-ray case: 148 x 128.5 x 12mm, front face ratio 0.868. Comment every
number with its source from docs/03-object-spec.md.

The hinge is one Y-axis rotation with a transformed origin at the spine.
Use CSS transform-style: preserve-3d. Three states: closed at a slight angle
with front and spine visible, open with the disc in the right tray, disc out.

Materials from the spec: translucent edges, visible thickness, spine darker
than the front face, slight gloss over the cover art, one soft contact
shadow.

Click to open on desktop, tap to open on mobile. Hover may preview the hinge
by a few degrees but must never be the only route into the interaction. Tab
reaches every state with a visible focus ring, and the toggles carry ARIA
state.

Use The Dark Knight.
```

Case thickness is the common failure. 12mm on a 171mm case is thin, and rendering it too thick makes the object read as a hardback book.

## Step 4: touch drag on the disc

Prompt:

```
Add drag-to-spin to the lifted disc. Use pointer events, not touch events,
so mouse and finger run through one code path. Release carries momentum with
a decay curve, then settles back into the ambient rotation.

Disabled under prefers-reduced-motion.
```

Test on the phone, not in the responsive emulator. Momentum feel does not survive a mouse simulation.

## Step 5: asset pipeline

Thirty entries go through the script. The ten games are resolved by hand.

Prompt:

```
Write scripts/fetch-assets.ts, run with tsx. Read the films, series and
albums arrays from src/data/lists.ts and fetch cover and disc per
docs/02-asset-sources.md.

Films and series: TMDB for the poster, fanart.tv moviedisc v3.2 for the
disc, joined on TMDB or IMDB id.
Albums: Cover Art Archive for the cover, fanart.tv cdart for the disc,
joined on MusicBrainz release-group id. Pin the fanart.tv version, since
v3.1 returns an object keyed by id and v3.2 returns an array.

MusicBrainz needs a descriptive User-Agent with contact details and one
request per second. fanart.tv needs a token bucket with exponential backoff.
Keys from .env.

Normalise with sharp: discs to a square canvas at fixed size, hub hole
aligned, transparent PNG only. Covers to the aspect ratio of their case
format.

Skip any entry that already has discSource set. Those are fixed by hand and
must not be overwritten.

Write credits.json recording source, URL and licence terms per asset.

Write the resolved tier back to the console per entry so I can see which
entries fell through to generated.
```

Games by hand. GameTDB covers `ps3`, so Black Ops II and Lego Star Wars: The Complete Saga have a route to a retail disc scan:

```
https://art.gametdb.com/ps3/coverfull/EN/{gameID}.png
```

The other eight are PS2, PS4 or PS5, which GameTDB does not cover. They generate from the cover art, except Rocket League and Cuphead, which are already fixed to burned. IGDB or SteamGridDB supplies the game covers. IGDB needs a Twitch developer account and OAuth client credentials.

## Step 6: ten film objects

Blocked until the notes are written.

Prompt:

```
Build the films list view using the ten entries in the films array in
src/data/lists.ts, including the notes.

Five are DVD keep cases and five are Blu-ray cases, so the two geometries
appear side by side. Both must sit correctly in the same row.

Only one object holds an open or disc-out state at a time. Closed objects
render as flat images with no 3D subtree and no filters. Cover art
lazy-loads.
```

This is where a mid-range phone falls over. Forty objects with live `preserve-3d` subtrees and gloss layers will not hold 60fps. Mount the 3D treatment on the active object only, from the start. Retrofitting it means rewriting the list view.

## Step 7: the other three media types

Albums are ten jewel cases, so the geometry is uniform and the work is the tray and the booklet on the left.

Series are ten DVD keep cases. Open decision 2 needs an answer first: one disc for the run, or a stack.

Games are the varied set. Four case and livery combinations across ten entries: PS2 in a black DVD case, PS3 and PS4 in Blu-ray geometry with different livery, PS5 in its own format. Build livery as a colour and band layer over the existing case component rather than four case components.

No Switch entries in the lists, so the Switch case and the cartridge are not needed. Drop them from the spec or leave them unbuilt.

## Step 8: layout

Open decision 4. The spine row is the better idea and the harder one on a 380px viewport.

Build the paged version first. Get forty objects working. Then try the shelf as a desktop enhancement with the paged view as the mobile path. Building the shelf first means designing the whole site around something that may have to be cut.

## Step 9: accessibility, colophon, deploy

Prompt:

```
Full pass. Tab order through all forty objects, visible focus rings, ARIA
state on the open and disc-out toggles, prefers-reduced-motion honoured on
every animated property.

Then build the colophon page from credits.json, listing every asset source
and its attribution requirement.
```

```bash
npm run build
npm run preview
```

Push to GitHub and connect Netlify, Vercel or GitHub Pages. Static output, no configuration.

## Standing checks

Scope drift into phase two shows up as "multiple lists", "let me reorder this in the UI", or the artists list. Lists are hardcoded in phase one. Editing them means editing the file.

Step 6 does not start before the notes are written. Forty objects with artwork and no writing is the tech demo the brief warns about.

Use plan mode for steps 3, 5 and 6. Those are the three where Claude Code writes four files when one was wanted.
