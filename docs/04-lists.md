# Lists

The content of the site. Everything else is scaffolding around it.

`src/data/lists.ts` is the file the app reads. This document is the readable copy and the place where open questions per entry are recorded. Change both together.

Fields per entry: rank, title, year, creator, case format, disc source, note.

Case format is one of: `dvd`, `bluray`, `jewel`, `switch`, `ps5`. It sets geometry only.
Livery is one of: `standard`, `ps2`, `ps3`, `ps4`, `ps5`. It sets colour and band over that geometry.
Disc source is one of: `retail`, `generated`, `burned`. Blank means the fetch script resolves it down the ladder.

Notes are empty. Write them before step 6.

## Films, all time

Case format follows release era, which is a stand-in for open decision 1. Films from 2008 onward get a Blu-ray case, earlier ones get a DVD keep case. Change any row where the format you owned was different.

| # | Title | Year | Director | Case | Disc | Note |
|---|---|---|---|---|---|---|
| 1 | The Dark Knight | 2008 | Christopher Nolan | bluray | | |
| 2 | Interstellar | 2014 | Christopher Nolan | bluray | | |
| 3 | Fight Club | 1999 | David Fincher | dvd | | |
| 4 | The Matrix | 1999 | Lana and Lilly Wachowski | dvd | | |
| 5 | Spider-Man 2 | 2004 | Sam Raimi | dvd | | |
| 6 | Spirited Away | 2001 | Hayao Miyazaki | dvd | | |
| 7 | Blade Runner 2049 | 2017 | Denis Villeneuve | bluray | | |
| 8 | This Is the End | 2013 | Seth Rogen and Evan Goldberg | bluray | | |
| 9 | Inception | 2010 | Christopher Nolan | bluray | | |
| 10 | Superbad | 2007 | Greg Mottola | dvd | | |

fanart.tv `moviedisc` coverage is strong for all ten. Expect retail discs throughout.

## Series, all time

Every entry is a DVD keep case, which is what a box set shipped in. Open decision 2 is unresolved: one disc for the whole run, or a stack.

| # | Title | Years | Creator | Case | Disc | Note |
|---|---|---|---|---|---|---|
| 1 | One Piece | 1999 to present | Eiichiro Oda | dvd | | |
| 2 | Breaking Bad | 2008 to 2013 | Vince Gilligan | dvd | | |
| 3 | Avatar: The Last Airbender | 2005 to 2008 | Michael Dante DiMartino and Bryan Konietzko | dvd | | |
| 4 | Game of Thrones | 2011 to 2019 | David Benioff and D. B. Weiss | dvd | | |
| 5 | Invincible | 2021 to present | Robert Kirkman | dvd | | |
| 6 | Vinland Saga | 2019 to present | Makoto Yukimura | dvd | | |
| 7 | Berserk | 1997 to 1998 | Kentaro Miura | dvd | | |
| 8 | It's Always Sunny in Philadelphia | 2005 to present | Rob McElhenney | dvd | | |
| 9 | Eastbound & Down | 2009 to 2013 | Danny McBride and Jody Hill | dvd | | |
| 10 | South Park | 1997 to present | Trey Parker and Matt Stone | dvd | | |

fanart.tv coverage for TV is thin. Most of these resolve to generated.

Two titles need confirming before the fetch script runs. Berserk is set to the 1997 adaptation rather than the 2016 one. One Piece is set to the 1999 anime rather than the 2023 live action.

## Albums, all time

| # | Title | Year | Artist | Case | Disc | Note |
|---|---|---|---|---|---|---|
| 1 | Currents | 2015 | Tame Impala | jewel | | |
| 2 | Man on the Moon III: The Chosen | 2020 | Kid Cudi | jewel | | |
| 3 | One of Wun | 2024 | Gunna | jewel | | |
| 4 | At.Long.Last.A$AP | 2015 | A$AP Rocky | jewel | | |
| 5 | 2014 Forest Hills Drive | 2014 | J. Cole | jewel | | |
| 6 | The Life of Pablo | 2016 | Kanye West | jewel | burned | |
| 7 | DAMN. | 2017 | Kendrick Lamar | jewel | | |
| 8 | Astroworld | 2018 | Travis Scott | jewel | | |
| 9 | Rommet | 2017 | Store P | jewel | | |
| 10 | Konnichiwa | 2016 | Skepta | jewel | | |

The Life of Pablo is fixed to burned. It never had an official CD pressing, so a burned disc is the accurate object rather than a fallback.

Rommet was released 3 October 2017 on S2OP. Cover Art Archive and fanart.tv `cdart` coverage for Norwegian rap is unverified. If it comes back empty, that entry falls to generated, which is a correct result rather than a failure.

## Games, all time

| # | Title | Year | Studio | Platform | Case | Livery | Disc | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | Elden Ring | 2022 | FromSoftware | PS5 | ps5 | ps5 | | |
| 2 | Call of Duty: Black Ops II | 2012 | Treyarch | PS3 | bluray | ps3-late | | |
| 3 | Sly 3: Honor Among Thieves | 2005 | Sucker Punch Productions | PS2 | dvd | ps2 | | |
| 4 | Lego Star Wars: The Complete Saga | 2007 | Traveller's Tales | PS3 | bluray | ps3-early | | |
| 5 | Call of Duty: Black Ops III | 2015 | Treyarch | PS4 | bluray | ps4 | | |
| 6 | Elden Ring Nightreign | 2025 | FromSoftware | PS5 | ps5 | ps5 | | |
| 7 | Dark Souls III | 2016 | FromSoftware | PS4 | bluray | ps4 | | |
| 8 | Rocket League | 2015 | Psyonix | PS4 | bluray | ps4 | burned | |
| 9 | Grand Theft Auto V | 2013 | Rockstar North | PS5 | ps5 | ps5 | | |
| 10 | Cuphead | 2017 | Studio MDHR | PS5 | ps5 | ps5 | burned | |

Year is the year of the work. Grand Theft Auto V is 2013 even though the PS5 version arrived in 2022.

GameTDB has a `ps3` path, but no shared join key ties it to whatever metadata source resolves these entries (no IGDB id, no reliable title match), so entries 2 and 4 need a manual lookup rather than an automated one even though GameTDB nominally covers the platform. GameTDB has no `ps4` or `ps5` path at all, and PS2 (entry 3) isn't covered either. All ten entries resolve to generated except Rocket League and Cuphead, which are fixed to burned — neither was ever in your hands as a PS5 disc. Covers aren't fetched automatically for any game: IGDB needs a Twitch developer account, so covers are sourced by hand.

## Parked: artists

Not a phase one list. An artist has no case, no disc and no canonical physical object, so it does not fit the object model in `01-project-brief.md`. Building it means inventing a fifth object type, which is phase two at the earliest.

Kept here so the ranking is not lost.

1. Tame Impala
2. Kid Cudi
3. Kanye West
4. A$AP Rocky
5. Travis Scott
6. XXXTENTACION
7. Nujabes
8. Store P
9. Yoguttene
10. Trippie Redd

## Genre lists, phase two

Park ideas here as they come up. Do not build them yet.

-
-
-
