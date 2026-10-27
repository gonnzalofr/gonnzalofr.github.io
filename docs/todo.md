# Todo

Things to do on the site, not yet scheduled. The migration phases are in `migration-plan.md`.

## Design

- [x] **Scroll bar matches the page's ground** (done 21 Oct 2026). `packages/tokens/src/css.ts` generates one rule per
  ground, `html:has(> body[data-ground="…"])`: the thumb in the dim ink, the track the ground itself, and
  `color-scheme: dark` on the dark grounds (black, walnut) so the browser's own parts follow. Home keeps its page ground
  (paper) for the whole page. A test in `packages/tokens` checks each rule and the thumb's contrast (at least 3:1).
  Browsers without `scrollbar-color` keep their own bar, which `color-scheme` still darkens on the dark pages.

## Left from the migration

Decisions for the owner, each kept as it was for parity (details in the phase 6 notes of `migration-plan.md`):

- [ ] `TU/e` is wrapped in `nc` on the home bands but not in the work-index rows; `.nc` changes nothing visible in "Reel", so it could be removed everywhere.
- [ ] Venus's and Rock Your Baby's stacks differ between their home band and their work-index row.
- [ ] The name voice's sizes (`.band__name`, `.row h3`, `.turn a`) are literal `clamp()`s, not tokens; SVG text sizes are literal pixels.
- [ ] `check_site.py`'s viewBox-width warning never fires (a lower-casing bug), so it is not a guard today.
- [ ] `svg-self-close.mjs` could go if the parity tool treated an empty SVG pair like a self-closed element.
- [ ] Case-study prose as MDX was not done (see the phase 6 notes for why).

## Security

Audited 25 Oct 2026 against `public/main` (f54bab6) and the live site. Nothing was changed: this is the list.
`[x]` = checked and fine, kept so the next audit has a baseline. `[ ]` = to do. **[urgent]**, **[soon]**, **[later]** rank
what is open.

**What the project is:** a static Astro 7 site (React components rendered at build time; the TMDS demo and the 3D board
are the only client-side JavaScript, as preact islands). `pnpm check` builds `apps/web/dist`;
`.github/workflows/deploy.yml` uploads it on every push to `main` and GitHub Pages serves it at
`https://gonnzalofr.github.io/` (public repo, no custom domain). There is no server, no API, no form, no cookie and no
analytics, so the bot traffic can only read public files. The real risks are in what could be published by mistake,
what the repo itself exposes, and who or what can push to `main`.

### 1. Secrets and private data

- [x] No credentials in the 16 commits of `public/main` (AWS, GitHub, Slack, Google and OpenAI-style keys, private-key
  blocks, `key = value` secrets: 0 hits) and none in the live HTML, JS and CSS. GitHub secret scanning and push
  protection are on. Redo this before any other repo is made public.
- [ ] **[urgent]** `CHECK_PRIVATE` is not set. The repo has no Actions secrets (`gh api
  repos/gonnzalofr/gonnzalofr.github.io/actions/secrets` returns none), so the CI guard that fails the build on your
  phone numbers is off on the live repo. Set it (Settings → Secrets and variables → Actions; the README's "Deploy"
  section says how) and test the regex locally with `CHECK_PRIVATE=… pnpm check`. Files: `.github/workflows/deploy.yml`
  (line 40), `tooling/check-site/check_site.py`.
- [ ] **[urgent]** Your personal Gmail address is in the public git history: 6 of the 16 commits on `public/main` have it
  as author (`git log public/main --format='%h %ae' | grep gmail`; the ones made in the GitHub web editor), 8 use the
  noreply address. Turn on "Keep my email addresses private" and "Block command line pushes that expose my email"
  (GitHub → Settings → Emails) so it stops. Rewriting history would break PR links and SHAs and cannot remove it from
  forks, caches or scrapers, so plan on treating that address as public.
- [ ] **[soon]** `.gitignore` has no `.env` entry (no such file exists today). Add `.env`, `.env.*` (keep
  `.env.example`), `*.pem`, `*.key`, `.secrets`.
- [ ] **[later]** When the real photos replace the placeholders (`apps/web/public/assets/work/*`), strip EXIF and GPS
  first (the current files have none) and add a `check_site.py` rule that fails on GPS data in a shipped JPEG.
- [x] The CV PDF has clean metadata (Creator Chromium, no author, no file paths). Recheck after every re-print.
- [x] The old private repo `website-portfolio` is archived again and private with Pages off. Its history was never
  reviewed for publishing: keep it private and never push its branches to the public repo.

### 2. What the deploy serves

- [x] Live probe: `.git/*`, `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `README.md`, `docs/*`,
  `.impeccable.md`, `.github/*`, `.astro` sources, backups and `.DS_Store` all return 404. Pages serves only the
  uploaded `apps/web/dist`.
- [x] No source maps: none of the 5 live bundles has a `sourceMappingURL`, and every `.map` URL returns 404.
- [ ] **[soon]** Make the checker enforce it: fail the build if `apps/web/dist` contains `*.map`, a dotfile other than
  `.nojekyll`, `*.bak`/`*.old`/`*.log`/`*.zip`/`*.sql`, an env file, a `sourceMappingURL`, or a `dev/` page (the
  phase 6 `/dev/kit` page must never ship). File: `tooling/check-site/check_site.py`.
- [ ] **[later]** `README.md`, `docs/` and `.impeccable.md` are public in the repo (not deployed). Read them once as a
  stranger would: they quote design decisions and owner confirmations.

### 3. Dependencies

`pnpm audit` found 7 advisories (1 high, 4 moderate, 2 low). `pip-audit` does not apply: the Python tooling uses only
the standard library.

- [x] **[soon]** Fix them in one dedicated PR (done 27 Oct 2026: `astro` 7.3.8, the `overrides` removed so vite is 8.3.5, `pnpm audit` clean, the minifier diff accepted and the golden build re-taken; see "Notes from the toolchain update" in `migration-plan.md`). All came from two things. `vite` 8.3.0 is pinned by `overrides` in
  `pnpm-workspace.yaml` (held back for the parity checks): fixed in >= 8.3.3 (GHSA-587h-7wmj-h5pm high, GHSA-698v-4r3x-3vcv,
  GHSA-r825-w8mm-5pxw, GHSA-rq7h-c2jc-7f22, GHSA-vfpm-58rq-9qcg, GHSA-9jrq-w75r-8gcw; the first three are in
  `launch-editor`, on Windows). `astro` 7.3.2: fixed in >= 7.3.3 (GHSA-mpr7-6m5w-76rw, CSS injection in View
  Transitions, which the site does not use). They affect the dev server and build tooling, not the built site, but
  you run the dev server on Windows. Bump `astro`, raise or drop the overrides, accept the minifier diff and re-take the
  golden build (`pnpm golden`), as the comment in `pnpm-workspace.yaml` says. Until then never run `pnpm dev --host`.
- [ ] **[later]** Minor updates waiting (`pnpm outdated -r`): react and react-dom 19.3.0 → 19.3.1, preact 11.0.1 →
  11.0.2, `@astrojs/react` 7.0.1 → 7.1.1, `@astrojs/check`, turbo 2.11.7 → 2.11.10, vitest 5.0.3 → 5.0.5. Keep the
  rule of pinning versions at least two weeks old. Update 27 Oct 2026: vitest went to 5.0.4 with the audit fix; the rest
  (react and react-dom 19.3.1, turbo 2.11.8, `@astrojs/react` 7.1.1, `@astrojs/check` 0.9.12, preact 11.0.2) wait for the
  14-day rule and go in a follow-up PR.
- [ ] **[soon]** Dependabot is off (alerts and security updates both disabled). Turn on alerts and security updates and
  add `.github/dependabot.yml` for `npm` and `github-actions` (weekly, grouped, with a cooldown so brand-new releases
  are not proposed).
- [ ] **[soon]** Pin the GitHub Actions to commit SHAs: `actions/checkout@v7`, `pnpm/action-setup@v6`,
  `actions/setup-node@v7`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5` are tags a maintainer can move.
  Then restrict allowed actions (now `all`) and turn on "require actions to be pinned to a full-length commit SHA".
  File: `.github/workflows/deploy.yml`.
- [ ] **[later]** A weekly scheduled workflow that runs `pnpm audit` and opens an issue (separate from the deploy, so a
  dev-only advisory never blocks a publish).

### 4. Security headers

GitHub Pages sends only `Strict-Transport-Security: max-age=31556952` and `Access-Control-Allow-Origin: *` and cannot
set others. Live check: no CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy or Permissions-Policy.

- [x] HTTPS is enforced (`https_enforced: true`; http gets a 301) and HSTS is on (1 year, no `includeSubDomains` or
  preload, which Pages does not offer).
- [ ] **[soon]** Add a Content-Security-Policy as `<meta http-equiv="Content-Security-Policy">` in
  `apps/web/src/layouts/Document.astro`: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self';
  font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'`. It fits: 8 of the 10
  pages have no inline script or style. The HDMI and HiFi pages have 2 inline scripts and 1 `<style>` each (Astro's
  island wrapper), which need per-page hashes added at build time (check whether Astro 7's own CSP support covers
  islands before writing a step). Test the TMDS demo and the 3D board (WebGL, `.glb` loaded from the same origin) with
  the browser console open for violations. A meta tag cannot carry `frame-ancestors`, `report-uri` or `sandbox`.
- [ ] **[later]** `<meta name="referrer" content="strict-origin-when-cross-origin">` in `Document.astro` (the browser
  default, but then it is stated). All outbound links already have `rel="noopener"` (0 missing).
- [ ] **[later]** X-Content-Type-Options and X-Frame-Options / `frame-ancestors` cannot be set on Pages. The risk is
  low (nothing to log in to, nothing to click on someone else's behalf). Decide and write down: accept it, or move to a
  host with a `_headers` file (Cloudflare Pages, Netlify), or put Cloudflare in front (needs a custom domain).
- [ ] **[later]** After any header change, run the live URL through securityheaders.com and the Mozilla Observatory.

### 5. Forms, input and XSS

- [x] The 10 pages and 5 bundles have no `<form>`, `fetch`, `XMLHttpRequest`, `WebSocket`, `eval`, `new Function`,
  `document.write`, cookie or storage use (localStorage only in the dev-only Tweaks bar).
- [x] Authored links cannot be `javascript:` URLs: the content schema (`packages/content/src/inline.ts`) only allows
  `https://`, `mailto:`, `#fragment` and site-root links.
- [ ] **[soon]** `apps/web/src/screens/LogEntry.tsx` renders the bench-log Markdown with `dangerouslySetInnerHTML`. Safe
  today only because the Markdown is in the repo and you write it. Add a comment saying so and a lint rule (phase 6 is
  looking at this), and sanitize if the log ever takes content from outside.
- [ ] **[later]** `innerHTML` appears only in the framework runtime bundle and the island hydration code. Confirm no
  app code writes it: `grep -rn "innerHTML" apps/web/src packages`.
- [ ] **[later]** Your university address is in 11 `mailto:` links, so scrapers will collect it. Fine for a CV site; if
  spam grows, switch to a hosted contact form with bot protection (Cloudflare Turnstile or similar), server-side
  validation and rate limits, with no secret in the client.

### 6. APIs and backend

- [x] None: no server, API route, database or login. The wildcard CORS header is GitHub's default and exposes only the
  public static files.
- [ ] **[later]** If an endpoint is ever added, review before shipping: authentication and authorization, a CORS
  allowlist (not `*`), rate limiting, input validation, secrets only in server environment variables (never in
  `PUBLIC_*`), and a CSP `connect-src` entry.

### 7. Hosting, DNS and the repo

- [x] HTTPS enforced; user site on `gonnzalofr.github.io` with no custom domain or `CNAME`, so no dangling-DNS or
  subdomain-takeover surface today. Only this repo has Pages on (all 17 repos checked; the rest are private or
  archived). No preview deployments: the `github-pages` environment only accepts `main`. No webhooks, deploy keys or
  forks; you are the only collaborator.
- [ ] **[soon]** `main` has no branch protection or ruleset, and the workflow deploys on every push to it, so a stolen
  token or session can publish anything. Add a ruleset on `main`: block force-pushes and deletion, require a pull
  request, require the build to pass (you can allow yourself to bypass). Pull requests run no CI today: add a
  `pull_request` trigger (not `pull_request_target`) that runs typecheck, test and check without the deploy job, with
  `permissions: contents: read`.
- [ ] **[soon]** Check the GitHub account itself: two-factor with a passkey or security key, review SSH keys, authorized
  OAuth apps and personal access tokens (give any token a short expiry; the `gh` CLI token used for audits is broad).
  This cannot be checked from the repo.
- [ ] **[later]** Delete merged branches: 6 `claude/*` branches are public (not deployed, but public history). Turn on
  "Automatically delete head branches" (now off).
- [ ] **[later]** Bot filtering and rate limiting: Pages has no WAF, no rate-limit setting and no access log. Scanner
  probes (`/wp-login.php`, `/.git/`) just get a 404 with no content (checked), so they cost nothing. If you want
  filtering anyway: a custom domain with Cloudflare in front (bot fight mode, rate-limit rules), then DNSSEC, a CAA
  record, and the domain verified in GitHub Pages settings against takeover. Decide whether that is worth it.
- [ ] **[later]** Know the limits Pages has (a soft limit of about 100 GB of traffic a month, and a published site of at
  most 1 GB): a scanner is unlikely to reach them on a site this small, so there is nothing to do except check the
  numbers if the site gets popular. GitHub's hourly build limit does not apply to sites deployed by a workflow.

### 8. Monitoring

- [ ] **[soon]** Raw access logs do not exist on Pages (and the repo's Insights → Traffic counts the repo, not the
  site), so "review the logs" is not possible as things are. Only a proxy gives you logs and firewall events
  (Cloudflare), or a cookieless analytics service. Decide, knowing that "no tracking" is currently a real property of
  the site.
- [ ] **[soon]** Alerts: add an uptime check on `https://gonnzalofr.github.io/` (UptimeRobot or Better Stack, free), and
  turn on GitHub notifications for failed Actions runs, so a broken or hijacked deploy is noticed.
- [x] No analytics or trackers in the live pages or bundles (Google Analytics and Tag Manager, Plausible, Umami,
  Matomo, Hotjar, Clarity, Cloudflare Insights, none found) and no third-party requests: outbound links to LinkedIn,
  GitHub and teamdaedalus.eu are plain links. If analytics is added: cookieless, no IP storage, say so in the footer,
  and update the CSP.
- [ ] **[later]** Add `/.well-known/security.txt` (a contact and an expiry date; 404 today), and put the recurring
  checks in one `pnpm security` script (the live path probe, the header check, `pnpm audit`) so the next audit is one
  command.
