// A page component: the content of one route, rendered by React inside Document.astro. Each one is a separate React
// tree, so it takes the page's Site (root prefix, placeholder gate) as a prop and provides it to the components.
import type { ComponentType } from 'react';
import { SiteProvider, type Site } from '@portfolio/ui';

export function screen<P extends object>(Body: ComponentType<P>) {
  return function Screen({ site, ...props }: P & { site: Site }) {
    return <SiteProvider site={site}><Body {...(props as P)} /></SiteProvider>;
  };
}
