// The dev kit: every component in examples.tsx, on every ground. Served at /dev/kit by `pnpm dev` only (see
// apps/web/tools/dev-routes.mjs); a build never contains it. Its CSS (kit.css) is imported by that route alone.
import type { ReactNode } from 'react';
import { grounds, groundNames, type Ground } from '@portfolio/tokens';
import { Figure, Page, Prose, SiteProvider, useSite, type Site } from '../index.ts';
import { examples, islandGrounds, type Example, type Group } from './examples.tsx';

const groups: Group[] = ['Chrome', 'Layout', 'Text', 'Figure', 'Work', 'Home'];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

function Item({ example, ground }: { example: Example; ground: Ground }) {
  const id = (name: string) => `${ground}-${name}`;
  const shown = example.render({ ground, id, root: useSite().root });
  return (
    <div className="devkit__item" id={id(`kit-${slug(example.title)}`)}>
      <p className="devkit__label"><span>{example.title}</span> <span>{example.covers.join(' · ')}</span></p>
      {example.note && <p className="devkit__note">{example.note}</p>}
      {example.frame === 'bare' ? shown : <Page as="div">{shown}</Page>}
    </div>
  );
}

function GroundSection({ ground, first }: { ground: Ground; first: boolean }) {
  return (
    <section className="devkit__ground" data-ground={ground} aria-labelledby={`${ground}-h`}>
      <Page as="div">
        <h2 className="devkit__ground-name col-full" id={`${ground}-h`}>{ground}</h2>
        <p className="devkit__ground-values col-full">{`${grounds[ground].g} · ${grounds[ground].ink} ink`}</p>
      </Page>
      {groups.map((group) => {
        const shown = examples.filter((e) => e.group === group && (first || !e.once));
        return (
          <div className="devkit__group" key={group}>
            <Page as="div"><h3 className="devkit__group-name col-full">{group}</h3></Page>
            {shown.map((e) => <Item key={e.title} example={e} ground={ground} />)}
          </div>
        );
      })}
    </section>
  );
}

/** `encoder` and `board`: the hydrated TmdsEncoder and BoardViewer, passed through named slots by the route. */
export function Kit({ site, encoder, board }: { site: Site; encoder?: ReactNode; board?: ReactNode }) {
  return <SiteProvider site={site}><KitPage encoder={encoder} board={board} /></SiteProvider>;
}

function KitPage({ encoder, board }: { encoder?: ReactNode; board?: ReactNode }) {
  return (
    <main id="main" className="devkit">
      <Page as="div">
        <h1 className="col-full devkit__title">Dev kit</h1>
        <div className="col-prose">
          <Prose>Every component of @portfolio/ui on every ground, from the list in packages/ui/src/kit/examples.tsx. This page exists under pnpm dev only. The tweaks bar (bottom left) changes the tokens live.</Prose>
          <p className="devkit__toc">{groundNames.map((g) => <a key={g} href={`#${g}-h`}>{g}</a>)}<a href="#islands-h">islands</a></p>
        </div>
      </Page>
      {groundNames.map((g, i) => <GroundSection key={g} ground={g} first={i === 0} />)}
      <section className="devkit__ground" data-ground={islandGrounds.TmdsEncoder} aria-labelledby="islands-h">
        <Page as="div">
          <h2 className="devkit__ground-name col-full" id="islands-h">islands</h2>
          <p className="devkit__ground-values col-full">hydrated; their ids are fixed, so each is shown once, on its own page's ground</p>
        </Page>
        <Page as="div">
          <Figure placement="bleed" id="fig-tmds" captionId="fig-tmds-cap" caption="TmdsEncoder (HDMI page).">{encoder}</Figure>
        </Page>
      </section>
      <section className="devkit__ground" data-ground={islandGrounds.BoardViewer} aria-label="BoardViewer">
        <Page as="div">
          <Figure placement="bleed" id="fig-board" variant="board" caption="BoardViewer (HiFi page).">{board}</Figure>
        </Page>
      </section>
    </main>
  );
}
