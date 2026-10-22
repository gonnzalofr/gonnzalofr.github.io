// Home: an introduction to him, then the work to choose from: one band per project on its own ground, the Daedalus
// band and the smaller builds.
import { Bands, BuildList, Choose, Inline, Intro, ProjectBand, TeamBand } from '@portfolio/ui';
import { builds, person, projects, team, views } from '@portfolio/content';
import { glimpses } from '../figures/glimpses';
import { screen } from './screen';

function Home() {
  return (
    <main id="main">
      <Intro
        kicker={<Inline html={views.homeKicker} />}
        name={person.name}
        deck="Second-year Electrical Engineering student at TU/e, Eindhoven. I do circuit and PCB design, Verilog on FPGAs and embedded C, and I write the testbenches that check the result."
        links={<><a href="cv.html">Read the CV</a> · <a href="assets/Gonzalo-Ferrero-Martin-CV.pdf">PDF, one A4 page</a> · <a href="#contact">Contact</a></>}
        facts={views.introFacts().map((f) => ({ label: f.label, value: <Inline html={f.value} /> }))}
      >
        <p>I like working the whole length of a device rather than one layer of it: the board, the HDL, the firmware on ESP32 and PYNQ boards, and the Python tooling that ties a bench together. Outside the coursework I build things — a DVI transmitter, the design of a battery-powered music player — and inside it I have been on a rover team and a first-year embedded project. At Student Team Daedalus, from January to 14 October 2026, I did PCB design, embedded programming and bench verification for a solar-powered autonomous aircraft for wildfire surveillance.</p>
        <p>What I care about is verification, not just getting something to blink: a self-checking testbench that decodes every symbol the encoder emits, a simulated frame dumped to a file with seven timing counts checked against constants, a sensor read confirmed by a vote before the robot acts on it.</p>
      </Intro>

      <Choose id="work" kicker={views.homeWorkKicker} title="Work">
        <Bands>
          {projects.map((p) => {
            const Glimpse = glimpses[p.slug];
            if (!Glimpse) throw new Error(`no glimpse for ${p.slug}: add one in src/figures/glimpses.tsx`);
            return (
              <ProjectBand
                key={p.slug}
                ground={p.ground}
                no={p.no}
                name={p.shortName}
                href={`work/${p.slug}.html`}
                line={<Inline html={p.band.line} />}
                meta={<Inline html={views.bandMeta(p)} />}
                glimpse={<Glimpse />}
              />
            );
          })}
          <TeamBand
            ground={team.ground}
            name={team.name}
            href={team.path}
            line={<Inline html={team.line} />}
            meta={<Inline html={views.teamBandMeta} />}
            spec={team.aircraft.map((f) => ({ label: f.label, value: <Inline html={f.value} /> }))}
          />
        </Bands>
        <BuildList items={builds.map((b) => ({ href: `work/index.html#${b.id}`, title: <Inline html={b.title} />, tag: views.buildTag(b) }))} />
      </Choose>
    </main>
  );
}

export default screen(Home);
