// The battery-powered HiFi player: a design study, stopped before any board was built.
import { Checklist, H2, Nb, Page, Prose, ProseBlock, PullQuote, usePublished } from '@portfolio/ui';
import { project } from '@portfolio/content';
import { AudioPath, BoardViewer, renders, Rev1, Rev2, Rev3, StackUp } from '../../figures/hifi-player';
import { screen } from '../screen';
import { ProjectHeader, ProjectTurn } from './case';

const p = project('hifi-player');

function HifiPlayer() {
  const shown = usePublished(...renders);
  return (
    <main id="main">
      <ProjectHeader project={p}>
        <AudioPath />
      </ProjectHeader>

      <Page>
        <ProseBlock>
          <H2 id="brief">The brief</H2>
          <Prose>A battery-powered HiFi music player, started in May 2026 and designed end to end: schematic capture, a four-layer PCB layout, the power path, and firmware on an ESP32-S3R8.</Prose>
          <Prose>I wanted one project that went through every step of a real product board rather than a dev kit with wires: choosing the parts, drawing the schematic, laying out a 4-layer board with a proper power path for a battery, and then writing the firmware that makes it play music. A music player is a good vehicle for this; it is obvious when it does not work.</Prose>

          <H2 id="sources">Two sources, one DAC</H2>
          <Prose>Audio streams in from Bluetooth or from a microSD card. Either source is routed through a MUX into an I2S DAC (Fig.&nbsp;1). The ESP32-S3R8 handles both sources on the same chip.</Prose>
          <Prose>The board is four layers (Fig.&nbsp;2). The power path is designed for battery operation, so the whole thing was meant to leave the bench.</Prose>

          <StackUp />

          <H2 id="board">The board</H2>
          <Prose>This is the current layout as a 3D model, straight from the EasyEDA Pro export: <Nb>70.9 × 50.4 mm</Nb>, and <Nb>8.5 mm</Nb> deep with the parts on. It is the design file, not a photograph; nothing on it was ever assembled.</Prose>

          <BoardViewer />

          <H2 id="revisions">Three revisions</H2>
          <Prose>The layout has been through three revisions{shown && ', and the renders (Figs. 4–6) show each one'}. Revision 1 is a small board with two buttons, a USB-C connector, a <Nb>3.5 mm</Nb> jack, a large rotary control and a 4-pin header.</Prose>

          {shown && <Rev1 />}

          <Prose>Revision 2 is a larger board that adds a Bluetooth module with its own crystal, four buttons, a microSD slot and the ESP32-S3R8 with its crystal.</Prose>

          {shown && <Rev2 />}

          <Prose>Revision 3 has four mounting holes, with the module and the ESP32 on the left, the DAC section and the <Nb>3.5 mm</Nb> jack top right, two electrolytic capacitors and the power section in the middle, USB-C, microSD and a JST battery connector along the bottom edge, and a 7-pin screen header at the top.</Prose>

          {shown && <Rev3 />}

          <PullQuote kicker="constraint">Four layers, a battery, and two audio sources sharing one DAC.</PullQuote>

          <H2 id="not-done">Where it stopped</H2>
          <Prose>I stopped the project in October 2026 at the design stage, to put the time into a project I find more engaging. It stands as a design exercise without physical verification: the schematic and the layout are done, and nothing was assembled, powered or tested, so nothing on this page is a measured result.</Prose>
          <Checklist items={[
            { state: 'done', text: 'schematic capture' },
            { state: 'done', text: '4-layer PCB layout (three revisions)' },
            { state: 'not built', text: 'power path bring-up' },
            { state: 'not finished', text: 'ESP32-S3R8 firmware' },
            { state: 'not built', text: 'board bring-up' },
          ]} />
          <Prose>The layout exists in three revisions{shown && ' (Figs. 4–6)'}. No board was assembled or powered, so there are no photographs of a built board.</Prose>
        </ProseBlock>

        <ProjectTurn project={p} />
      </Page>
    </main>
  );
}

export default screen(HifiPlayer);
