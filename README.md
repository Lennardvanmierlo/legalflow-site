# site/ — Legalflow landingspagina

**Award-worthy, terughoudende landingspagina.** Conversiemachine voor demo-gesprekken,
niet het product. Leidt met **verdedigbaarheid + je-data-blijft-bij-jou**; het
verificatie-artefact is de held. Geen accounts, geen BYOK-form (de connector ís het product).

## Designsysteem (Claude/Anthropic-identiteit)
- **Twee-kleuren-systeem met betekenis:**
  - **Claude-klei `#C6613F`** (live gesampled van anthropic.com) = merk + actie: CTA,
    eyebrows, kickers, het cursieve woord in de hero, brand-dot. Kleine kleitekst gebruikt
    `--accent-text #A8492A` (donkerder, haalt WCAG AA op ivoor: 5,5:1).
  - **Groen `#2C6E48`** = uitsluitend verificatie-semantiek: `✓ geverifieerd`, `GATE: DOOR`,
    de gate-sectie, FASE-4. (Klei = "dit is je Claude, doe iets"; groen = "geverifieerd".)
  - Basis = Anthropic-ivoor `#FAF9F5` / `#F0EEE6`, inkt `#141413`.
  - Status: onbevestigd = amber `#8A6D2F`, mismatch = oxbloed `#8C3A2E`.
  - WCAG AA: kleiknoppen hebben bijna-zwarte tekst (4,55:1).
- **Typografie:** Newsreader (editorial serif, ~Anthropic Serif) + Geist Sans (body) +
  Geist Mono (citaten/ECLI's/rapport). Self-hosted woff2 in `fonts/`, system-fallback.
- **Boodschap:** "een juridische upgrade voor je eigen Claude" — geen nieuwe tool, maar
  de AI die je al gebruikt, verdedigbaar gemaakt.
- **Layout:** broadsheet split-screen hero (artefact rechts), royale witruimte, baseline-ritme.
- **Motion:** minimaal sub-300ms; één signature — voetnoot *claim* → `✓ geverifieerd`.
  `prefers-reduced-motion` gehonoreerd.

> Historie: eerste versie gebruikte research-gekozen bosgroen; op verzoek omgezet naar
> Claude-identiteit zodat de site voelt als een upgrade ván Claude (visuele continuïteit).

## Structuur
- `index.html` — alle 11 secties (hero · probleem · pipeline · de gate · bewijs ·
  vertrouwelijkheid · install-funnel · voor wie · commercieel · FAQ · footer).
- `css/styles.css` — designsysteem + alle componenten (zero dependencies).
- `js/main.js` — nav, scroll-reveals, de signature-animatie, copy-knoppen (vanilla, ~5KB).
- `fonts/` — self-hosted woff2 (Newsreader, Geist, Geist Mono).
- `WIRE-UP-TODO.md` — de twee open placeholders (connector uit Sessie B, skill uit Sessie C)
  + kleinere (Cal.com, e-mail, bewijs-PDF's) + deploy-recept (eigen VM).

## Lokaal bekijken
```
cd site && python3 -m http.server 8731   # → http://localhost:8731
```
(Direct `file://` openen kan ook, maar via een server laden de fonts schoner.)

## Status
Lokaal af + ge-QA'd (desktop 1440 + mobiel 390, console schoon, fonts laden, animatie +
FAQ + copy-knoppen werken). Open: de 2 funnel-placeholders → zie `WIRE-UP-TODO.md`.
