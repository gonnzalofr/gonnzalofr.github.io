// Rock Your Baby: a first-year cradle built as four PYNQ-Z2 boards talking over UART.
import { H2, Nb, Page, Prose, ProseBlock, PullQuote } from '@portfolio/ui';
import { project } from '@portfolio/content';
import { Subsystems } from '../../figures/rock-your-baby';
import { screen } from '../screen';
import { ProjectHeader, ProjectTurn } from './case';

const p = project('rock-your-baby');

function RockYourBaby() {
  return (
    <main id="main">
      <ProjectHeader project={p}>
        <Subsystems />
      </ProjectHeader>

      <Page>
        <ProseBlock>
          <H2 id="boards">Four boards, three links</H2>
          <Prose>A first-year TU/e project: a baby-monitoring cradle built as four subsystems, each on its own PYNQ-Z2, each in C on libpynq, talking over UART (Fig.&nbsp;1). The decision-making board polls the heartbeat and crying boards for their latest values, then sends a single command byte to the actuator.</Prose>
          <Prose>Splitting it that way meant each board could be developed and tested on its own, with a byte protocol between them. The lesson that stuck was about interfaces: agree the bytes first, then build.</Prose>

          <H2 id="heartbeat-crying">Heartbeat and crying</H2>
          <Prose>The heartbeat board samples an analog heart-rate signal through the ADC, filters it with an adaptive exponential filter — heavy smoothing on slow changes, almost none on fast edges — and detects beats on the rising edge. Each beat interval is converted to BPM; anything above <Nb>240</Nb> is rejected as impossible, and the result is averaged over the last five beats and rounded to the nearest <Nb>5</Nb> before it is sent. The <Nb>240×240</Nb> TFT shows the number and, below it, the live waveform: <Nb>240</Nb> samples per sweep, about <Nb>1.5 s</Nb> each, redrawn after every sweep.</Prose>
          <Prose>The crying board listens to a microphone through the ADC and reports loudness as RMS over a 4,000-sample window with the noise floor subtracted. Raw RMS is mostly room noise, so the board calibrates on an initial stretch of silence and subtracts the floor in the energy domain; the floor keeps adapting, but only while the room is quiet, so a crying baby cannot teach the board that crying is normal. Capture and calculation, sending, and display run as three separate pthreads so the sample period stays steady while the screen draws, and the volume level goes out over UART.</Prose>

          <PullQuote kicker="constraint">RMS with the noise floor subtracted, on its own capture thread.</PullQuote>

          <H2 id="decision-actuator">Decision and actuator</H2>
          <Prose>The decision-making board fuses both inputs into a single stress number and picks a rocking frequency and amplitude from <Nb>1 to 5</Nb>: a <Nb>5×5</Nb> grid of settings, walked one step at a time, alternating between changing frequency and changing amplitude, keeping a move only if the stress number went down. The current cell, the candidate and the rejected ones are painted on its TFT so you can watch it think, and each chosen setting is forwarded over UART.</Prose>
          <Prose>The actuator decodes one command byte and drives two PWM channels: one for the frequency of the rocking motion, one for its amplitude. The PWM period is <Nb>100,000</Nb> ticks, and each of the five settings maps to a duty cycle of <Nb>10, 20, 40, 60 or 80 %</Nb> of it. It shows its current state on its own display, so the team could confirm what the cradle thought it was doing without reading the UART.</Prose>

          <H2 id="status">Status</H2>
          <Prose>Complete: a first-year project, <Nb>2025 – 26</Nb>. Nothing on this page is a measured result; the filter, the RMS window and the duty cycles above are what the code does, so there is no verification section.</Prose>
        </ProseBlock>

        <ProjectTurn project={p} />
      </Page>
    </main>
  );
}

export default screen(RockYourBaby);
