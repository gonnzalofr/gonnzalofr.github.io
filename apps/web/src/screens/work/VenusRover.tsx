// The Venus rover: a PYNQ-Z2 rover that hunts cubes with a partner robot, its autopilot written to survive dropouts.
import { H2, MarginNote, Mono, Nb, Page, Prose, ProseBlock, PullQuote, usePublished } from '@portfolio/ui';
import { project } from '@portfolio/content';
import { Architecture, Autopilot, BenchFront, BenchSide, Blocks, photos, SensorStack } from '../../figures/venus-rover';
import { screen } from '../screen';
import { ProjectHeader, ProjectTurn } from './case';

const p = project('venus-rover');

function VenusRover() {
  const shown = usePublished(...photos);
  return (
    <main id="main">
      <ProjectHeader project={p}>
        <Autopilot />
      </ProjectHeader>

      <Page>
        <ProseBlock>
          <H2 id="task">The task</H2>
          <Prose>For the 5EID0 “Venus Project” (Group 10, 2026) a PYNQ-Z2 rover has to hunt colored cubes, map terrain, and coordinate with a partner robot over one MQTT link — UART0 to an ESP32 to the broker. The firmware is C, runs from boot, and I also wrote the Python mission-control tool.</Prose>
          <Prose>Two rovers start back to back at the origin of an arena bounded by black tape, with cubes of two sizes, <Nb>3 cm</Nb> and <Nb>6 cm</Nb>, and obstacles we called mountains. The job is to find all six cubes, report each with its position, size, color and the local temperature, and stop. No operator and no keyboard: the firmware starts with no arguments and talks only over MQTT, so the robot has to be sure of what it has seen before it acts on it.</Prose>
          <Prose>The report’s non-functional requirements set the tempo: the distance array had to refresh the obstacle logic at ≥ <Nb>10 Hz</Nb>, a cliff or boundary had to stop forward motion within <Nb>200 ms</Nb>, and the map had to update within <Nb>1 s</Nb> of a packet. The wireless link is an ESP32-C3-WROOM-02 connectivity board on UART, speaking MQTT to the broker; only wireless communication was allowed during the mission (Fig.&nbsp;2).</Prose>

          <Architecture />

          <H2 id="sensors">Sensors and odometry</H2>
          <MarginNote>1600 steps/rev · Ø75 mm · 120 mm track</MarginNote>
          <Prose>A vertical stack of three VL53L0X time-of-flight sensors sits on a shared I²C bus: the bottom beam for <Nb>3 cm</Nb> cubes, the middle for <Nb>6 cm</Nb> cubes, the top for obstacles — “mountains” (Fig.&nbsp;3). Two TCRT5000 IR sensors watch for the black-tape boundary, a TCS3200 reads color, and an NTC thermistor reads temperature. Two stepper-driven wheels give differential drive, with dead-reckoned odometry from the commanded steps — no encoders: <Nb>1600 steps/rev</Nb>, <Nb>Ø75 mm</Nb> wheels, <Nb>120 mm</Nb> track.</Prose>
          <Prose>Every VL53L0X ships at the same I²C address, <Mono>0x29</Mono>, so the bus is sorted out at boot: the firmware holds the middle and bottom sensors in shutdown through their XSHUT pins, finds the always-on top sensor and moves it to <Mono>0x68</Mono>, then wakes the other two one at a time and re-addresses them to <Mono>0x69</Mono> and <Mono>0x6A</Mono>.</Prose>

          <SensorStack />

          <Prose>The XSHUT bring-up was verified with an I²C bus scanner after each boot phase: one device at <Mono>0x29</Mono>, then <Mono>0x68</Mono> and <Mono>0x29</Mono>, then <Mono>0x69</Mono> joins, ending at a stable <Mono>0x68 / 0x69 / 0x6A</Mono>. Settling delays below <Nb>50 ms</Nb> caused boot-timing collisions, which is why the firmware waits <Nb>100 ms</Nb>. Disconnecting AR4 or AR5 to simulate a dead sensor made the driver log a non-fatal timeout and carry on without locking the bus.</Prose>
          <Prose>The NTC divider — <Nb>10 kΩ</Nb>, <Nb>3.3 V</Nb>, <Nb>β = 4050 K</Nb> — first read wrong because the ADC’s input impedance loaded the divider; a unity-gain op-amp buffer between divider and ADC fixed it. The TCS3200 is read as a frequency: S0/S1 at <Nb>20 %</Nb> scaling, calibrated against white and black, <Nb>20</Nb> static readings per cube, classified by Euclidean distance to five color profiles. It is accurate at the <Nb>15–20 mm</Nb> working distance and degrades with range. Fig.&nbsp;4 shows how the sensors, the control loop and the link fit together, with the interfaces as they are actually wired.</Prose>

          <Blocks />

          <PullQuote kicker="verification">A cube is a cube when at least two of six reads agree within <Nb>5 cm</Nb>.</PullQuote>

          <H2 id="autopilot">The autopilot</H2>
          <Prose>Four reactive states: SCAN, turning in <Nb>5°</Nb> steps, <Nb>72</Nb> per revolution, looking for the nearest unknown cube on the beams; APPROACH, driving toward a remembered cube and steering around a mountain if one is closer; EVALUATE, reading the color, registering and reporting the cube, then backing off <Nb>5 cm</Nb>; and ROAM, turning a random direction and driving <Nb>40 cm</Nb> when a full sweep finds nothing. A boundary-evade interrupt is checked at the top of every tick and pre-empts all four (Fig.&nbsp;1).</Prose>
          <Prose>The approach switches to an open-loop final drive inside <Nb>10 cm</Nb>, because the time-of-flight sensors cannot read below about <Nb>6 cm</Nb>, and gives up after <Nb>30</Nb> ticks rather than pushing forever. When the IR sensors see tape, the evade reverses, turns about <Nb>180°</Nb> with <Nb>±30°</Nb> of jitter, drops any approach in progress, and re-scans.</Prose>

          {shown && <BenchFront />}

          <H2 id="dropout">What survives a dropout</H2>
          <Prose>Time-of-flight reads drop out, so a cube is confirmed by a 6-read burst vote: at least two reads within <Nb>5 cm</Nb>. Color is averaged over <Nb>20</Nb> reads, and a cube is registered on detection strength, so a weak color read never discards a real find. Finds are deduplicated within <Nb>12 cm</Nb>. The thresholds were tuned against on-bench ToF readings, and the README says so, so the next person can re-measure rather than guess.</Prose>
          <Prose>Both robots share one world frame — same origin, back-to-back headings — so a cube position from either robot is comparable with no transform at run time. Every new find goes out as a JSON frame over UART0 to the ESP32, which relays it to the broker; the partner drains its UART each tick and folds any find with a known color into its own registry. When the sixth cube is known, by either robot, both stop.</Prose>

          <H2 id="mission-control">Mission control</H2>
          <Prose>The Python mission-control tool is an MQTT relay between the two robots, a JSON message logger, and a live matplotlib map of both robots’ paths, headings and every cube, drawn to scale — <Nb>3 cm</Nb> against <Nb>6 cm</Nb>.</Prose>
          <H2 id="revisions">Six revisions</H2>
          <Prose>The firmware went through six revisions. The third is the structural one: the sensor code, the ToF driver and the MQTT framing that had lived in separate files were consolidated into a single <Mono>main.c</Mono> of about <Nb>2,600</Nb> lines that links against only libpynq and libm, so deployment is one <Mono>gcc</Mono> command and a copy.</Prose>

          {shown && <BenchSide />}
        </ProseBlock>

        <ProjectTurn project={p} />
      </Page>
    </main>
  );
}

export default screen(VenusRover);
