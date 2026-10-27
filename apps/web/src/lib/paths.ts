// The prefix that turns a path from the site root ("cv.html", "assets/…") into a relative href on the current page:
// '' on root pages, '../' on work/ and log/ pages (and dev/, under `pnpm dev`), and the site's absolute origin on the 404, which GitHub Pages
// serves at any depth. Every href on the site stays relative, so the built site also works opened from disk.
export function rootPrefix(url: URL, site: URL | undefined): string {
  if (/^\/404/.test(url.pathname)) return new URL('./', site).href;
  return /^\/(work|log|dev)(\/|$)/.test(url.pathname) ? '../' : '';
}
