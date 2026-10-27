// The design system's React components. Each sits beside the CSS file that styles it; styles.css imports all of
// those in cascade order. Components take props and never read @portfolio/content: pages pass the data in.
export { SiteProvider, useSite, usePublished, type Site } from './site.tsx';

export { Col, type Span, type Hook } from './layout/Col.tsx';
export { Page, ProseBlock, type PageVariant } from './layout/Page.tsx';
export { PageHeader } from './layout/PageHeader.tsx';
export { Section } from './layout/Section.tsx';

export { Inline, parseInline } from './text/Inline.tsx';
export { Nb, Mono, Vh, Name, Status, type StatusValue } from './text/Marks.tsx';
export { Kicker, Deck, H2, Prose, PullQuote, MarginNote } from './text/Voice.tsx';
export { EntryBody } from './text/EntryBody.tsx';
export { MetaRow, FactList, Checklist, EntryList, LinkList, Timeline, KeyValueRows, type Labeled, type CheckState } from './text/Lists.tsx';

export { Figure, FigScroll, Diagram, ArrowMarker, Hatch, Photo, PhotoFigure, type Placement, type PhotoProps } from './figure/Figure.tsx';
export { Envelope, EnvelopeLabel, ScaleBar } from './figure/Envelope.tsx';

export { SiteHeader, type Current } from './chrome/SiteHeader.tsx';
export { Footer } from './chrome/Footer.tsx';
export { Turn, type TurnTarget } from './chrome/Turn.tsx';

export { CaseHeader } from './work/CaseHeader.tsx';
export { ProjectRow } from './work/ProjectRow.tsx';
export { Choose, Bands, ProjectBand, TeamBand, Glimpse, BuildList } from './work/ProjectBand.tsx';
export { Curriculum, type CurriculumYear } from './work/Curriculum.tsx';
export { Intro } from './home/Intro.tsx';
