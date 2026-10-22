// Renders a component to the HTML a page would get, inside a SiteProvider for a page one level down.
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SiteProvider, type Site } from '../src/site.tsx';

export const site: Site = { root: '../', isPlaceholder: (src) => src.includes('placeholder') };
export const html = (node: ReactNode, s: Site = site) => renderToStaticMarkup(<SiteProvider site={s}>{node}</SiteProvider>);
