# Diskette

A personal site. Each entry in a ranked list renders as the physical object it
shipped as. A case opens, a disc lifts out and spins.

Phase one only: four lists of ten, films series albums games. If a request
implies accounts, search, multiple lists per medium, or runtime fetching, stop
and say that it belongs to phase two or three.

Read @docs/01-project-brief.md, @docs/02-asset-sources.md and
@docs/03-object-spec.md before non-trivial work. 03 holds the real dimensions.
@docs/05-build-plan.md holds the build order and the current step.
@docs/04-lists.md holds the content and the open question per entry.

## Stack

TypeScript, Vite, React. No backend, no database, no accounts.
Lists live in `src/data/lists.ts` and are edited by hand.
No image loads from a third-party API at runtime. Assets are fetched once by a
script, processed, and committed under `public/assets`.
API keys live in `.env` and are never committed.

## Data

`src/data/lists.ts` holds all forty entries. It is the source of truth. Never
invent a title, substitute a placeholder, or use lorem ipsum. If something is
missing from it, ask.

`case` sets geometry. `livery` sets colour and band over that geometry. A PS3
and a PS4 game share Blu-ray case geometry and differ only in livery.

`discSource` is optional. Absent means the fetch script resolves it down the
ladder: retail, then generated, then burned. Present means it is fixed and the
script must not override it.

Do not write the `note` field for any entry. Matti writes those. Empty notes
are expected until he fills them.

## Rules

CSS 3D transforms over WebGL. Reach for Three.js only on the disc-in-case
reveal, and say so explicitly before writing any of it.
Mobile is not a downgrade of desktop. If an interaction needs hover, it is not
finished.
Every interactive object is reachable by tab with a visible focus ring.
`prefers-reduced-motion` disables the spin and cuts the hinge instead of
animating it.
Comment the geometry. Every hardcoded dimension names its millimetre source
from `03-object-spec.md`.
Only one object holds an open or disc-out state at a time. Closed objects
render as flat images with no 3D subtree and no filters.
Produce whole files, not fragments marked "rest unchanged".

## Writing

Applies to interface copy, code comments, commit messages and docs.

No em-dashes. No clichés, no superlatives, no promotional tone.
Short active sentences. State things without editorialising their importance.
Headings in sentence case.
Do not end a sentence with a dangling "-ing" clause that interprets the
sentence before it.
Never attribute a claim to "experts" or "reports" without naming the source.
Interface copy uses plain verbs and names things by what the user controls. A
button that says "Open" produces an open case.
