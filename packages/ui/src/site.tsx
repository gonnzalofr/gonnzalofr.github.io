// What a component needs to know about the page it renders on, provided once at the root of each page's React tree:
// the prefix that turns a path from the site root ("cv.html", "assets/…") into a relative href ('' on root pages,
// '../' on work/ and log/ pages, the site's absolute origin on the 404), and whether an image under public/ is still
// one of the labeled placeholders (those never reach a page). It also numbers the page's figures.
import { createContext, useContext, type ReactNode } from 'react';

export interface Site {
  root: string;
  /** `src` as the page writes it ("../assets/work/hifi-rev1.png"). */
  isPlaceholder: (src: string) => boolean;
}

interface PageState extends Site { figures: { n: number } }

// Outside a SiteProvider every image counts as a placeholder: a page that forgets the gate shows less, never a placeholder.
const SiteContext = createContext<PageState>({ root: '', isPlaceholder: () => true, figures: { n: 0 } });

export function SiteProvider({ site, children }: { site: Site; children: ReactNode }) {
  return <SiteContext value={{ ...site, figures: { n: 0 } }}>{children}</SiteContext>;
}

export const useSite = (): Site => useContext(SiteContext);
/** True when none of the images is a placeholder. */
export function usePublished(...srcs: string[]): boolean {
  const { isPlaceholder } = useContext(SiteContext);
  return !srcs.some(isPlaceholder);
}
/** The next figure number on this page (Fig. 1, 2, …, in the order the figures render). */
export const useNextFigure = (): number => ++useContext(SiteContext).figures.n;

/** Joins class names, skipping the empty ones. */
export const cx = (...names: (string | false | undefined)[]): string => names.filter(Boolean).join(' ');
