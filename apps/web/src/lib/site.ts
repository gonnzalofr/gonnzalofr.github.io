// What the React components need to know about the page being built (see Site in @portfolio/ui): the root prefix
// for its links, and the placeholder gate for its images.
import type { Site } from '@portfolio/ui';
import { rootPrefix } from './paths';
import { isPlaceholder } from './placeholder';

export function siteFor(url: URL, site: URL | undefined): Site {
  return { root: rootPrefix(url, site), isPlaceholder };
}
