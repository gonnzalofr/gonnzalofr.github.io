// Inline copy from @portfolio/content, turned into React elements. The copy is validated there and may hold only the
// site's inline marks, so this reads exactly that grammar and throws on anything else:
//   <span class="nb|nc|mono|status|vh">…</span>   <span aria-hidden="true">…</span>   <br>
//   <a href="…">…</a>   <a href="…" rel="noopener">…</a>      and the entities &amp; &lt; &gt; &nbsp; &quot;
// A link written from the site root ("~/notes.html#daedalus") gets the page's root prefix.
import { createElement, Fragment, type ReactNode } from 'react';
import { useSite } from '../site.tsx';

const TOKEN = /<span class="(nb|nc|mono|status|vh)">|<span aria-hidden="true">|<a href="([^"]*)"( rel="noopener")?>|<\/(span|a)>|<br>|<|[^<]+/g;
const ENTITY = /&(amp|lt|gt|nbsp|quot);/g;
const CHARS: Record<string, string> = { amp: '&', lt: '<', gt: '>', nbsp: ' ', quot: '"' };

interface Open { tag: 'span' | 'a'; props: Record<string, string>; children: ReactNode[] }

/** Parses inline copy into React nodes; `root` replaces the "~/" of root-relative links. */
export function parseInline(html: string, root: string): ReactNode[] {
  const top: ReactNode[] = [];
  const stack: Open[] = [];
  const add = (node: ReactNode) => (stack.at(-1)?.children ?? top).push(node);
  const key = () => (stack.at(-1)?.children ?? top).length;
  for (const m of html.matchAll(TOKEN)) {
    const [t, mark, href, rel, close] = m;
    if (mark) stack.push({ tag: 'span', props: { className: mark }, children: [] });
    else if (t === '<span aria-hidden="true">') stack.push({ tag: 'span', props: { 'aria-hidden': 'true' }, children: [] });
    else if (href !== undefined) {
      stack.push({ tag: 'a', props: { href: href.startsWith('~/') ? root + href.slice(2) : href, ...(rel && { rel: 'noopener' }) }, children: [] });
    } else if (close) {
      const open = stack.pop();
      if (!open || open.tag !== close) throw new Error(`inline copy: unbalanced </${close}> in ${JSON.stringify(html)}`);
      add(createElement(open.tag, { ...open.props, key: key() }, ...open.children));
    } else if (t === '<br>') add(createElement('br', { key: key() }));
    else if (t === '<') throw new Error(`inline copy: mark not allowed at ${JSON.stringify(html.slice(m.index, m.index + 40))}`);
    else add(t.replace(ENTITY, (_, name: string) => CHARS[name]!));
  }
  if (stack.length) throw new Error(`inline copy: unclosed <${stack.at(-1)!.tag}> in ${JSON.stringify(html)}`);
  return top;
}

/** Inline copy, with links resolved for the current page. */
export function Inline({ html }: { html: string }) {
  return createElement(Fragment, null, ...parseInline(html, useSite().root));
}
