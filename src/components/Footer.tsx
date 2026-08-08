import { assetUrl } from '../assetUrl'
import './Footer.css'

/**
 * The four sources every asset on the site traces back to, in the order
 * specified: TMDB, fanart.tv, MusicBrainz, GameTDB. Each unit is that
 * site's own logo file (committed under public/assets/marks, recorded in
 * credits.json under "site-marks") above its plain name, the whole unit a
 * link to that site.
 *
 * TMDB is the one source with fixed required wording (their free-tier
 * terms: the logo plus this exact disclaimer), so that line sits on its
 * own beneath the row rather than folded into TMDB's own unit — the other
 * three ask only for credit and a link, which the row itself already is.
 */
const sources = [
  {
    name: 'TMDB',
    href: 'https://www.themoviedb.org/',
    logo: assetUrl('/assets/marks/tmdb-logo.svg'),
  },
  {
    name: 'fanart.tv',
    href: 'https://fanart.tv/',
    logo: assetUrl('/assets/marks/fanart-tv-logo.svg'),
  },
  {
    name: 'MusicBrainz',
    href: 'https://musicbrainz.org/',
    logo: assetUrl('/assets/marks/musicbrainz-logo.svg'),
  },
  {
    name: 'GameTDB',
    href: 'https://www.gametdb.com/',
    logo: assetUrl('/assets/marks/gametdb-logo.png'),
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <ul className="footer__sources">
        {sources.map((source) => (
          <li key={source.name} className="footer__source">
            <a
              className="footer__source-link"
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="footer__source-logo"
                src={source.logo}
                alt={source.name}
                loading="lazy"
              />
              <span className="footer__source-name">{source.name}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="footer__credit">
        Laget av Mathias Sætersdal ·{' '}
        <a className="footer__credit-link" href="mailto:mathias@saetersdal.no">
          mathias@saetersdal.no
        </a>
      </p>
      <p className="footer__attribution">
        This product uses the TMDB API but is not endorsed or certified by
        TMDB.
      </p>
    </footer>
  )
}
