// The living style guide's content: one example per component (or per small family of them), shown by the dev kit
// (Kit.tsx) on every ground. The data is made up and short; what matters is the component's own markup and CSS.
//
// A new component needs an entry here: a test (test/kit.test.tsx) fails while an exported component is in no `covers`.
// Add the entry to the group of the folder the component lives in, with the props a real page would pass.
import type { ReactNode } from 'react';
import type { Ground } from '@portfolio/tokens';
import {
  ArrowMarker, Bands, BuildList, CaseHeader, Checklist, Choose, Col, Curriculum, Deck, Diagram, EntryBody, Envelope, EnvelopeLabel,
  FactList, Figure, Glimpse, H2, Hatch, Inline, Intro, Kicker, KeyValueRows, LinkList, MarginNote,
  MetaRow, Mono, Name, Nb, EntryList, PageHeader, Photo, PhotoFigure, ProjectBand, ProjectRow, Prose, ProseBlock,
  PullQuote, ScaleBar, Section, SiteHeader, Status, TeamBand, Timeline, Turn, Vh,
} from '../index.ts';

export type Group = 'Chrome' | 'Layout' | 'Text' | 'Figure' | 'Work' | 'Home';

export interface Example {
  group: Group;
  title: string;
  /** The exported components this example shows (a test checks that every exported component is in one). */
  covers: string[];
  /** What to look at, in a line. */
  note?: string;
  /** The component sets an id (or is a landmark) the page can hold only once: shown on the first ground only. */
  once?: boolean;
  /** 'bare': the component is a grid or a landmark itself, so it is not put inside a `.page`. */
  frame?: 'page' | 'bare';
  /** `id` makes an id unique per ground; `root` is the prefix for a path from the site root (assets/…). */
  render: (ctx: { ground: Ground; id: (name: string) => string; root: string }) => ReactNode;
}

const other: Record<Ground, [Ground, Ground]> = {
  black: ['paper', 'walnut'], paper: ['sand', 'black'], sand: ['dusk', 'paper'], walnut: ['black', 'dusk'], dusk: ['walnut', 'sand'],
};

const frameFile = 'assets/hdmi-frame-640x480.png';
const lorem = 'The board, the HDL, the firmware and the Python that ties a bench together: one device, the whole length of it.';

const drawing = (
  <>
    <rect className="crisp" x="40" y="30" width="200" height="60" />
    <text className="t-ink" x="52" y="66">encoder</text>
    <line className="s-axis" x1="240" y1="60" x2="420" y2="60" markerEnd="url(#arr-kit)" />
    <rect className="crisp f-hatch" x="430" y="30" width="200" height="60" />
    <text x="440" y="108">blanking</text>
  </>
);

export const examples: Example[] = [
  // ---- Chrome
  {
    group: 'Chrome', title: 'Site header', covers: ['SiteHeader'], once: true, frame: 'bare',
    note: 'The four-corner chrome. Sticky on a real page; static here.',
    render: () => <SiteHeader current="work-index" hasLog />,
  },
  {
    group: 'Chrome', title: 'Contact footer', covers: ['Footer'], once: true,
    note: 'Closes every page, this one too: it is the footer at the bottom of this page (its id is fixed).',
    render: () => <Prose>See the end of the page.</Prose>,
  },
  {
    group: 'Chrome', title: 'Previous and next project', covers: ['Turn'],
    note: 'Each link carries the ground of the project it opens.',
    render: ({ ground }) => {
      const [prev, next] = other[ground];
      return <Turn prev={{ href: '#', no: '01', name: 'A project', ground: prev }} next={{ href: '#', no: '03', name: 'Another project', ground: next }} />;
    },
  },

  // ---- Layout
  {
    group: 'Layout', title: 'Placement', covers: ['Col', 'Page', 'ProseBlock'],
    note: 'Col span is the only way to put something on the 12-column grid.',
    render: () => (
      <ProseBlock>
        <Col span="head" as="h2">head</Col>
        <Col span="prose">prose: the reading column.</Col>
        <Col span="margin">margin: a quiet note beside it.</Col>
        <Col span="a">a: the left half.</Col>
        <Col span="b">b: the right half.</Col>
        <Col span="full">full: the whole width.</Col>
      </ProseBlock>
    ),
  },
  {
    group: 'Layout', title: 'Page header', covers: ['PageHeader'], frame: 'bare',
    note: 'The kicker, the one h1 (wide), the deck.',
    render: () => (
      <PageHeader kicker="Personal project · Jul 2026 – present" title="A project name, set wide" deck="One sentence about what it is and how it was checked.">
        <MetaRow items={[{ label: 'Role', value: 'Everything' }, { label: 'Stack', value: 'Verilog · XSIM' }]} />
      </PageHeader>
    ),
  },
  {
    group: 'Layout', title: 'Section', covers: ['Section'], frame: 'bare',
    render: ({ id }) => (
      <Section id={id('section')} reading="3 entries" title="A section">
        <Prose>The rule, the reading in the margin column and the heading, then the content.</Prose>
      </Section>
    ),
  },

  // ---- Text
  {
    group: 'Text', title: 'Two voices', covers: ['Kicker', 'Deck', 'H2', 'Prose'],
    note: 'Wide names, then small. There is no third size.',
    render: ({ id }) => (
      <ProseBlock>
        <Kicker span="full">Kicker · context and dates</Kicker>
        <H2 id={id('h2')}>A heading in prose</H2>
        <Deck>The deck: one sentence under a title.</Deck>
        <Prose>{lorem}</Prose>
      </ProseBlock>
    ),
  },
  {
    group: 'Text', title: 'Inline marks', covers: ['Nb', 'Mono', 'Vh', 'Name', 'Status', 'Inline'],
    note: 'Quantities stay on one line, identifiers set in mono, status in words. The hidden text is for screen readers.',
    render: () => (
      <Prose>
        <Name given="Gonzalo" family="Ferrero Martín" />{' · '}
        <Nb>25.175 MHz</Nb>{' · '}<Mono>decode(encode(d)) == d</Mono>{' · '}<Status value="in progress" />{' · '}<Status value="complete" />{' · '}<Status value="design only" />{' · '}
        <Vh>read by screen readers only</Vh>{' · '}
        <Inline html={'inline copy with a <span class="nb">4.0 m</span> quantity and a <a href="#">link</a>'} />
      </Prose>
    ),
  },
  {
    group: 'Text', title: 'Pull quote and margin note', covers: ['PullQuote', 'MarginNote'],
    render: () => (
      <ProseBlock>
        <MarginNote>25.175 MHz pixel clock · 800×525 total</MarginNote>
        <Prose>{lorem}</Prose>
        <PullQuote kicker="verification"><Mono>decode(encode(d)) == d</Mono>, on every symbol.</PullQuote>
      </ProseBlock>
    ),
  },
  {
    group: 'Text', title: 'Metadata row', covers: ['MetaRow'],
    render: () => (
      <MetaRow items={[
        { label: 'Role', value: 'Everything' }, { label: 'Stack', value: 'Verilog · XSIM' },
        { label: 'Board', value: 'PYNQ-Z2' }, { label: 'Status', value: <Status value="in progress" /> },
      ]} />
    ),
  },
  {
    group: 'Text', title: 'Facts', covers: ['FactList'],
    render: () => (
      <>
        <FactList variant="intro" items={[{ label: 'Study', value: 'BSc EE, TU/e' }, { label: 'Languages', value: 'Verilog, C, Python' }]} />
        <div className="col-a"><FactList variant="spec" items={[{ label: 'Span', value: '4.0 m' }, { label: 'Mass', value: '1.8 kg' }]} /></div>
      </>
    ),
  },
  {
    group: 'Text', title: 'Checklist', covers: ['Checklist'],
    note: 'States in words, with a drawn box (ticked when done).',
    render: () => (
      <Checklist items={[
        { state: 'done', text: 'Timing generator' }, { state: 'in progress', text: 'Serializer' },
        { state: 'not built', text: 'Board bring-up' }, { state: 'not finished', text: 'Layout review' },
      ]} />
    ),
  },
  {
    group: 'Text', title: 'Entries and links', covers: ['EntryList', 'LinkList'],
    render: ({ id }) => (
      <>
        <EntryList items={[
          { id: id('entry-a'), kicker: 'Coursework · 2025', title: 'A smaller build', body: 'One line about what it is.' },
          { id: id('entry-b'), kicker: 'Side project · 2026', title: 'Another one', body: 'And one line about this.' },
        ]} />
        <LinkList items={[{ href: '#', label: 'Work', note: 'its case studies' }, { href: '#', label: 'CV', note: 'one page' }]} />
      </>
    ),
  },
  {
    group: 'Text', title: 'Timeline and key-value rows', covers: ['Timeline', 'KeyValueRows'],
    render: () => (
      <>
        <Timeline entries={[
          { date: 'Jan – Oct 2026', role: 'Member', text: 'Student Team Daedalus' },
          { date: '2025 – 26', role: 'First-year project', text: 'Rock Your Baby' },
        ]} />
        <KeyValueRows rows={[{ label: 'Languages', text: 'Verilog, C, Python' }, { label: 'Tools', text: 'Vivado, KiCad' }]} parts="closing line in mono" />
      </>
    ),
  },

  {
    group: 'Text', title: 'Log entry body', covers: ['EntryBody'],
    note: 'A Markdown body rendered to HTML at build time; the one place a string becomes markup.',
    frame: 'bare',
    render: () => <EntryBody html="<p>A paragraph of an entry, as Astro rendered it from the Markdown.</p><ul><li>a list item</li><li>another</li></ul>" />,
  },

  // ---- Figure
  {
    group: 'Figure', title: 'Figure with a drawing', covers: ['Figure', 'FigScroll', 'Diagram'],
    note: 'Numbered in render order; the scroll box is a tab stop labeled by the caption.',
    render: () => (
      <Figure placement="right" caption="A drawing from real numbers, in the ground's ink.">
        <Diagram viewBox="0 0 800 130" title="A box, an arrow and a hatched box.">{drawing}</Diagram>
      </Figure>
    ),
  },
  {
    group: 'Figure', title: 'Hatch and arrow', covers: ['Hatch', 'ArrowMarker'], once: true,
    note: 'Defined once per page: the CSS reads url(#hatch).',
    render: () => (
      <Figure placement="bleed" caption="The shared definitions.">
        <Diagram viewBox="0 0 800 130" title="Defines the hatch and the arrowhead.">
          <defs><Hatch stroke="s-rule" /><ArrowMarker id="arr-kit" /></defs>
          {drawing}
        </Diagram>
      </Figure>
    ),
  },
  {
    group: 'Figure', title: 'Photograph', covers: ['Photo', 'PhotoFigure'],
    note: 'PhotoFigure renders nothing while its file is a placeholder.',
    render: ({ root }) => (
      <>
        <PhotoFigure placement="right" src={root + frameFile} width={640} height={480} alt="A 640 by 480 frame with three red ramps." caption="A published image." />
        <Photo src={root + frameFile} width={640} height={480} alt="The same image, bare." />
      </>
    ),
  },
  {
    group: 'Figure', title: 'Timing envelope', covers: ['Envelope', 'EnvelopeLabel', 'ScaleBar'],
    render: ({ root }) => (
      <div className="col-a">
        <Envelope><img src={root + frameFile} width="640" height="480" alt="" /></Envelope>
        <EnvelopeLabel side="bottom">800 × 525</EnvelopeLabel>
        <ScaleBar length={800} marks={[{ at: 0 }, { at: 640, repeat: true }, { at: 800 }]} />
      </div>
    ),
  },

  // ---- Work
  {
    group: 'Work', title: 'Case-study header', covers: ['CaseHeader'], frame: 'bare',
    render: () => (
      <CaseHeader
        kicker="Personal project · Jul 2026 – present"
        name="A project name"
        deck="One sentence about what it is."
        cells={[{ label: 'Role', value: 'Everything' }, { label: 'Stack', value: 'Verilog' }, { label: 'Board', value: 'PYNQ-Z2' }, { label: 'Status', value: <Status value="in progress" /> }]}
      />
    ),
  },
  {
    group: 'Work', title: 'Work-index row', covers: ['ProjectRow'],
    render: ({ id }) => (
      <ProjectRow
        id={id('row')} no="01" name="A project name" href="#"
        deck="One line about what it is."
        notice={<><Mono>decode(encode(d)) == d</Mono> on every symbol.</>}
        meta={['Verilog · XSIM', 'Jul 2026 – present', <Status key="s" value="in progress" />]}
      />
    ),
  },
  {
    group: 'Work', title: 'Curriculum', covers: ['Curriculum'],
    render: () => (
      <Curriculum years={[{ n: 1, dates: 'Sep 2025 – Jul 2026', line: 'complete · 60 ECTS', quartiles: [
        { state: 'complete', courses: [{ code: '5EWC0', name: 'Challenge', type: 'core', ects: 5 }, { code: '5EWC0', name: 'Challenge', type: 'continued' }] },
        { state: 'in progress', courses: [{ code: '5ESA0', name: 'Signals', type: 'core', ects: 5 }] },
      ] }]} />
    ),
  },

  // ---- Home
  {
    group: 'Home', title: 'Introduction', covers: ['Intro'], frame: 'bare',
    render: () => (
      <Intro
        kicker="Electrical Engineering · TU/e"
        name={{ given: 'Gonzalo', family: 'Ferrero Martín' }}
        deck="One sentence about who he is and what he does."
        links={<><a href="#">Read the CV</a> · <a href="#">PDF</a></>}
        facts={[{ label: 'Study', value: 'BSc EE, TU/e' }, { label: 'Next', value: 'Internship' }]}
      >
        <p>{lorem}</p>
      </Intro>
    ),
  },
  {
    group: 'Home', title: 'Bands', covers: ['Choose', 'Bands', 'ProjectBand', 'TeamBand', 'Glimpse', 'BuildList'], frame: 'bare',
    note: 'A band takes the ground it is given; the whole band opens the project.',
    render: ({ ground, id, root }) => (
      <Choose id={id('choose')} kicker="Case studies · sample" title="Work">
        <Bands>
          <ProjectBand
            ground={ground} no="01" name="A project name" href="#"
            line="One line about the project and how it was checked."
            meta={<>Verilog · XSIM · <Status value="in progress" /></>}
            glimpse={<Glimpse kind="env"><Envelope><img src={root + frameFile} width="640" height="480" alt="" /></Envelope></Glimpse>}
          />
          <TeamBand
            ground={ground} name="A student team" href="#" line="One line about the team."
            meta="Jan – Oct 2026"
            spec={[{ label: 'Span', value: '4.0 m' }, { label: 'Mass', value: '1.8 kg' }]}
          />
        </Bands>
        <BuildList items={[{ href: '#', title: 'A smaller build', tag: 'coursework' }, { href: '#', title: 'Another', tag: 'side project' }]} />
      </Choose>
    ),
  },
];

/** The two islands, hydrated by the kit's route (a component gets a `client:*` directive only in an .astro file). Their
 *  ids are fixed, so each is shown once, on the ground its page uses. */
export const islandGrounds = { TmdsEncoder: 'black', BoardViewer: 'paper' } as const satisfies Record<string, Ground>;
