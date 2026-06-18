# Wire-up TODO — Legalflow landingspagina

De site is lokaal af. Alleen de onderstaande placeholders staan nog open; ze worden
ingevuld zodra Sessie B (connector) en Sessie C (skill-plugin) klaar zijn. Alle
placeholders zijn in de code herkenbaar aan de string `PLACEHOLDER_` en — in de
install-sectie — visueel gemarkeerd met een amber "⚙ WIRE-UP"-blok.

Snel vinden: `grep -rn "PLACEHOLDER_" site/`

---

> **GEWIJZIGD (OAuth-besluit):** geen bearer-token meer op de site. De connector gebruikt OAuth
> (zelf-gehoste authorization-server met gedeelde toegangscode) — de klant autoriseert in Claude,
> er staat dus géén secret in de pagina. De connector-URL is nu definitief ingevuld. De install-
> sectie is herschreven naar twee routes: A (Claude Code) en B (Cowork). Enige resterende
> install-placeholder: de marketplace-repo-URL.

## 1. Connector-URL  ✅ INGEVULD (OAuth, geen token)

**Waar:** [index.html](index.html), install-sectie, route B (Cowork) — de `.btn-copy`-knop.
De URL `https://34-63-206-170.sslip.io/mcp` staat er. Geen token: de klant klikt in Claude op
**Autoriseren** en voert zijn toegangscode in. De toegangscode komt via onboarding, niet via de
site (geen accounts). `data-open="https://claude.ai"` opent Claude bij het kopiëren.

## 2. Marketplace-repo-URL  ✅ INGEVULD

Gepubliceerd: **https://github.com/Lennardvanmierlo/legalflow-plugin** (publiek, secret-vrij).
De install-knop (route A) kopieert nu:
`/plugin marketplace add Lennardvanmierlo/legalflow-plugin` + `/plugin install legalflow@legalflow`.
Het amber WIRE-UP-blok in die kaart is verwijderd.

---

## Kleinere placeholders (uitvragen Lennard, geen sessie-afhankelijkheid)

| Placeholder | Waar | Wat |
|:--|:--|:--|
| `PLACEHOLDER_CALCOM_URL` | hero-CTA, demo-sectie-CTA, "Boek een demo"-links | Cal.com-boekingslink. Staat op meerdere plekken — `grep` vindt ze. |
| `PLACEHOLDER_CONTACT_EMAIL` | footer, contact-kolom | Contact-e-mailadres (`mailto:`). |
| Privacy-link (`href="#"`) | footer | Privacy-/cookieverklaring zodra die er is. |

> Let op: de nav- en hero-knop "Boek een demo" wijzen nu naar `#demo` (de
> commerciële sectie op de pagina). De knóp *in* die sectie wijst naar
> `PLACEHOLDER_CALCOM_URL`. Beslis of álle demo-knoppen direct naar Cal.com moeten,
> of dat de huidige "scroll-eerst-naar-uitleg, dan-boek"-flow blijft.

---

## Status / klaar wanneer
- [x] Award-worthy HTML/CSS af, QA'd in echte browser (desktop 1440 + mobiel 390).
- [x] Signature-animatie (claim → ✓ geverifieerd), scroll-reveals, FAQ, copy-knoppen werken.
- [x] Self-hosted fonts (Newsreader + Geist + Geist Mono), graceful fallback zonder JS.
- [x] Placeholder 1 (connector-URL) — ingevuld, OAuth (geen token).
- [x] Placeholder 2 (marketplace-repo) — gepubliceerd: Lennardvanmierlo/legalflow-plugin.
- [ ] Cal.com-link, contact-e-mail, privacy invullen — uitvragen Lennard.
- [ ] Bewijs-PDF's koppelen: memo + citatierapport via `/make-pdf` uit `demo-artefacten/`,
      neerzetten als bv. `site/bewijs/` en de `data-proof`-links in de bewijs-sectie
      laten wijzen naar die bestanden.

---

## Deploy — ✅ LIVE op de eigen VM (Caddy)

**Live URL:** https://legalflow.34-63-206-170.sslip.io/
**Waar:** GCE-instance `wizzlebot` (zone `us-central1-a`, IP 34.63.206.170) — dezelfde VM als de
connector. De box draait **Caddy** (niet nginx), die TLS termineert en al `34-63-206-170.sslip.io`
→ de node-MCP (`:8787`) proxyt. De site is een **apart Caddy-siteblok** op een eigen sslip.io-host,
dus de connector is niet aangeraakt. Caddy regelt automatisch het Let's Encrypt-cert.

**Deploy-procedure (herhaalbaar):**
```bash
cd ~/lf-site/site && tar czf /tmp/lfsite.tgz --exclude='*.md' .
gcloud compute scp /tmp/lfsite.tgz wizzlebot:~/lfsite.tgz --zone us-central1-a
gcloud compute ssh wizzlebot --zone us-central1-a --command \
  "sudo tar xzf ~/lfsite.tgz -C /var/www/legalflow && sudo find /var/www/legalflow -name '._*' -delete; sudo chmod -R a+rX /var/www/legalflow && rm ~/lfsite.tgz"
```
(Geen Caddy-reload nodig bij alleen bestandsupdates; `file_server` leest live van schijf.)

**Het Caddy-siteblok** (staat in `/etc/caddy/Caddyfile` op de VM; backup = `Caddyfile.bak.lfsite`):
```caddy
legalflow.34-63-206-170.sslip.io {
	root * /var/www/legalflow
	encode gzip zstd
	file_server
	header {
		Content-Security-Policy "default-src 'self'; script-src 'self' 'sha256-tHd4qJ0R/vQfI0CbRTiL3XGSi+Tun7VhOcDbx08aLKA='; style-src 'self'; font-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests"
		Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
		X-Content-Type-Options "nosniff"
		X-Frame-Options "DENY"
		Referrer-Policy "strict-origin-when-cross-origin"
		Permissions-Policy "geolocation=(), microphone=(), camera=(), browsing-topics=()"
		Cross-Origin-Opener-Policy "same-origin"
		Cross-Origin-Resource-Policy "same-origin"
		-Server
	}
	@woff2 path *.woff2
	header @woff2 Cache-Control "public, max-age=31536000, immutable"
}
```
Na Caddyfile-wijziging: `sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile`
dan `sudo systemctl reload caddy` (graceful, raakt de connector niet).

**Echt domein later (1 regel):** vervang `legalflow.34-63-206-170.sslip.io` door je domein,
wijs een A-record naar 34.63.206.170, reload Caddy → cert komt automatisch.

> **CSP-hash.** `'sha256-tHd4qJ0R/…'` hoort exact bij de inline `<head>`-regel
> `document.documentElement.className+=" js";`. Wijzigt die regel (één teken), herbereken met
> `printf '%s' '<inhoud>' | openssl dgst -sha256 -binary | openssl base64` en update het blok.
> Anders blokkeert CSP het script → geen scroll-reveals (content blijft wél zichtbaar, no-JS fallback).
>
> **Geen inline `style=` of `<style>` in de HTML** — die blokkeert `style-src 'self'` (hashes
> gelden niet voor style-attributen). Alle styling via `css/styles.css`. Gecontroleerd: 0 CSP-violations live.

**CSO-pass live geverifieerd:** alle security-headers aanwezig, 0 console/CSP-violations,
connector blijft draaien. Optioneel naverifiëren met securityheaders.com / Mozilla Observatory.
