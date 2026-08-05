import './Footer.css'

/**
 * The page currently just stopped after the games row (frontend-design
 * review) — this is what it ends on instead. Two lines: the attribution
 * TMDB's own free tier requires, and a link to the credits page proper.
 * /kreditering doesn't exist yet (the next pass) — a plain anchor, not a
 * client route, since this project has no router: it 404s today and
 * starts working the moment that page is built, with nothing here to
 * revisit.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__attribution">
        Coverbilder og platebilder fra TMDB, fanart.tv, MusicBrainz og GameTDB.
      </p>
      <a className="footer__link" href="/kreditering">
        Kreditering
      </a>
    </footer>
  )
}
