// A bench-log entry's body: the entry's Markdown as Astro rendered it to HTML (apps/web/src/content/log/*.md; the
// figures are raw HTML in the Markdown). The one place a string becomes markup, and safe because of where the string
// comes from: the repository's own files, rendered once at build time, never a reader's input, never at runtime. The
// checker still reads every page it produces. Moving the log to MDX (docs/migration-plan.md, section 4.7) removes it.
export function EntryBody({ html }: { html: string }) {
  return (
    <div className="prose-block col-full entry__body">
      <div className="fig--right entry__text" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
