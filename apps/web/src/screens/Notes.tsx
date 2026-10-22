// Notes: Student Team Daedalus, then the BSc program quartile by quartile.
import { Curriculum, Inline, MetaRow, Nb, PageHeader, Prose, Section, type CurriculumYear } from '@portfolio/ui';
import { courseByCode, team, views, when, type Course, type Year } from '@portfolio/content';
import { screen } from './screen';

const course = (c: Course) => {
  if ('continues' in c) return { code: c.code, name: courseByCode(c.code).name, type: 'continued' };
  return { code: c.code, name: c.name, type: c.spans ? `${c.type} · ${c.spans}` : c.type, ects: c.ects };
};
const year = (y: Year): CurriculumYear => ({
  n: y.n,
  dates: when(y.dates),
  line: views.yearLine(y),
  quartiles: y.quartiles.map((q) => ({ state: q.state, courses: q.courses.map(course) })),
});

function Notes() {
  return (
    <main id="main">
      <PageHeader kicker="Student Team Daedalus · Curriculum" title="Notes" deck="The student team I built with, and what I am studying — quartile by quartile." />

      <Section id="daedalus" reading={<Inline html={views.teamReading} />} title={team.name}>
        <Prose><a href="https://www.teamdaedalus.eu/" rel="noopener">Team Daedalus</a> is a multidisciplinary student team at Eindhoven University of Technology, founded in 2021 and based at the TU/e Innovation Space: <Nb>39</Nb> students from more than <Nb>15</Nb> countries building a solar-powered autonomous aircraft for prolonged aerial surveillance, aimed at wildfire detection. Airframes, avionics and power electronics are all designed, manufactured and tested in-house, in iterative prototypes called Lapyx — each one a refinement of the last, each crash folded into the next build.</Prose>

        <Prose>The current aircraft, Lapyx 4, has a <Nb>4.0 m</Nb> wingspan, weighs <Nb>9.2 kg</Nb>, carries <Nb>225 W</Nb> of solar cells across the upper wing and three <Nb>16 Ah</Nb> cells in the fuselage, and flies with a fully integrated autopilot. Its maiden flight on 25 February 2026 ran in both manual and autopilot modes, completed a <Nb>100 km/h</Nb> speed test and validated an estimated endurance of about seven hours on battery alone — before a mechanical failure cut the power and ended the flight in a crash. The team rebuilt it over the spring; the second flight was planned for September 2026.</Prose>

        <Prose>I joined in January 2026 as an electrical engineer, one of six in the Electrical / Embedded Systems department, and was a member until 14 October 2026. The department owns the aircraft’s electronics — the systems in development include the Daedawatt Ultra MPPT solar charge controller, the DaedaLink avionics bus, the DaedaFind LTE/GNSS tracker and the DaedaBuzz recovery buzzer — and my part of it was PCB design, embedded programming and bench verification.</Prose>
        <Prose>The electronics are built alongside seven other departments — mechanical and airframe, avionics, computer and machine vision, business, PR and communication, the board — so a board is designed against an airframe that is being built at the same time, a power budget the solar array sets, and avionics written by someone else. The rebuild after the maiden flight worked the same way: the crash’s lessons had to be carried into every subsystem at once, with the second flight already on the calendar for September.</Prose>

        <MetaRow items={[
          { label: 'Department', value: <Inline html={team.department} /> },
          { label: 'Role', value: <Inline html={team.role} /> },
          { label: 'Member', value: when(team.dates, 'long') },
          { label: 'Team', value: <a href={team.url} rel="noopener">{`${team.urlLabel} `}<span aria-hidden="true">↗</span></a> },
        ]} />
      </Section>

      <Section id="curriculum" reading={<Inline html={views.curriculumReading} />} title="Curriculum">
        <Prose>The three-year program, laid out the way TU/e schedules it: four quartiles a year, five credits a course, with the first-year challenge and the bachelor project spanning two quartiles at ten. Year one is complete, with a weighted average of <Nb>9.58 / 10</Nb>. The first half of year two is what I am enrolled in now; everything after that is the plan as it stands, electives included. Each course is listed as its code, its title and its credits in ECTS.</Prose>

        <Curriculum years={views.curriculum.map(year)} />
      </Section>
    </main>
  );
}

export default screen(Notes);
