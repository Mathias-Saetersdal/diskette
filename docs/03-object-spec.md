# Object spec

The physical objects and how they behave. Dimensions are real millimetres, used as ratios rather than absolute sizes. Verify the ones marked with a question mark against a real case before hardcoding.

## Cases

| Format | H × W × D (mm) | Front face ratio (w/h) | Used for |
|---|---|---|---|
| DVD keep case | 190 × 135 × 14 | 0.711 | Films, series box sets |
| Blu-ray case | 171 × 135 × 12 | 0.789 | Films, PS5 and Xbox games |
| CD jewel case | 142 × 125 × 10 | 0.880 | Albums |
| Switch case (?) | 170 × 105 × 11 | 0.618 | Switch games |

The disc is the same object across all of them: 120mm diameter, 15mm centre hole. The clear polycarbonate inner ring runs from the hole out to roughly 46mm diameter, where the printed area begins. A stacking ring sits at about 26 to 33mm.

That inner ring is the detail that makes a rendered disc read as real. Retail disc scans usually include it as transparency. Do not fill it.

## Interactions

Three states per object. Closed, open, disc out.

**Closed.** The case sits at a slight angle, front face and spine both visible. This is the list view. On a shelf layout, only the spine is visible until an object is brought forward.

**Open.** The case swings on its hinge. The disc is visible in the tray on the right, artwork or a booklet on the left. The hinge is the only real 3D requirement in the whole project, and it is a single rotation on the Y axis with a transformed origin.

**Disc out.** The disc lifts from the tray, moves to centre, and spins. Spin should be slow, roughly 4 to 8 seconds per rotation, not a blur. A blurred disc loses the artwork, which is the entire reason for the interaction.

Desktop: click to open, click the disc to lift it. Hover can preview the hinge by a few degrees, but it must never be the only way to discover the interaction.

Mobile: tap to open, tap the disc to lift it. Drag on a lifted disc to spin it by hand and let it carry momentum. This is the one interaction that is better on touch than with a mouse, and it is worth building properly.

`prefers-reduced-motion` disables the spin and shortens the hinge to a cut.

## Disc rendering

### Retail

Composite the transparent PNG onto the tray. Add a specular sweep on top: a low-opacity conic gradient rotating slowly, offset from the disc rotation so the highlight moves across the artwork rather than with it. This single effect does most of the work in making a flat PNG read as reflective plastic.

### Generated

For entries with no retail scan.

1. Take the cover art. Crop to a square from the centre, then to a circle at 120 units.
2. Punch the 15mm hole and the clear ring out to 46mm, as transparency.
3. Overlay the specular sweep.
4. Optional: a thin printed ring at the outer edge, 2mm in, which is how most retail discs are trimmed.

The result is honest. It does not pretend to be a retail scan, and it looks like the disc a print-on-demand release would have shipped.

### Burned

For entries with no physical release at all, and available as a deliberate style for any entry.

Two variants, because the medium determines the dye:

- **CD-R**, for albums. Recording side reads cyan-green, or pale gold for phthalocyanine stock. Label side is silver or matte white.
- **DVD-R**, for films, series and games. Recording side reads violet-blue. Label side is silver or matte white.

Construction:

1. Base disc in the dye colour, with the specular sweep at higher intensity than a printed disc. Blank recordable media is more reflective, not less.
2. A printed manufacturer ring near the hub, small type, low contrast. This is what sells it. A perfectly clean blank looks like a mistake. A blank with a faint ring of unreadable printing looks like something out of a spindle.
3. The title in marker across the middle of the disc, straight rather than curved. People wrote across the disc, not around it.
4. Slight rotation, 2 to 5 degrees. Slight vertical offset from centre. Never perfectly aligned.
5. Optional second line, smaller: the year, or "DISC 1", or nothing.

Typography: a marker face rather than a script face. Permanent Marker, Rock Salt or Shadows Into Light from Google Fonts. Permanent Marker is the closest to an actual Sharpie on plastic. Set it in caps for films and games, mixed case for albums, because that is roughly how people wrote them.

Ink colour: near-black with a slight blue or purple cast, at around 90% opacity so the disc surface shows through. Pure black on a reflective surface looks printed rather than written.

A refinement worth building later: let the title be drawn rather than typed, so the handwriting is mine. That turns the fallback into the most personal object on the shelf.

### On the framing

The burned disc is nostalgic because it is what a shelf looked like when you could not buy everything. Home recording, mix discs, backups, copies passed between friends. The interface copy should describe what the thing is, not narrate where it came from. Call it "burned" in the format label and leave it there. The object carries the association on its own.

## Materials

Whatever else is true, the objects have to look like plastic and paper rather than flat rectangles.

- Case body: slightly translucent at the edges, with a visible thickness. A 12mm depth on a 171mm case is thin, and rendering it too thick is the most common way this kind of thing looks wrong.
- Spine: darker than the front face, because it sits in shadow on a real shelf.
- Cover art: printed on paper behind clear plastic. A very slight gloss layer over the artwork, not a heavy one.
- Tray: opaque black or grey, with the visible hub teeth.
- Shadow: one soft contact shadow under the object. Not a drop shadow on the artwork.

## Build order

1. One disc, spinning, with a retail PNG. No case. Prove the spin and the specular sweep look right before anything else.
2. The burned disc generator. It is self-contained, it has no data dependency, and it is the piece most likely to be fun.
3. One case, opening, with that disc in the tray.
4. Touch drag on the disc.
5. Ten objects in a list.
6. The other three media types.
7. The list-level layout, shelf or paged.

Step one either works or it does not, and it decides whether this is a CSS project or a Three.js project. Do not build a list layout before you know which.
