---
title: "The Venus rover on the bench"
date: 2026-06-19
summary: "Two photographs of the rover as it was built: a PYNQ-Z2 and a breadboard on an Avular base, a printed sensor mount at the front, and the ESP32 module above it."
tags: ["venus-rover", "bench"]
---

These two photographs are the [Venus rover](../work/venus-rover.html) as it stood on the bench; the entry is dated to the project report. The case study describes the firmware; this is what the firmware ran on.

<figure class="fig fig--right"><img class="fig__img fig__img--portrait" src="../assets/work/venus-bench-front.jpg" width="1125" height="2000" alt="The Venus rover from the front: an Avular two-wheeled base, the PYNQ-Z2 in its case on top with a prototype shield and a breadboard, and a 3D-printed mount at the front carrying two IR sensor boards at the corners, a color sensor board with four white LEDs in the middle, and time-of-flight boards stacked above; a white holder with the ESP32 module sits above the mount." loading="lazy" decoding="async"><figcaption><span class="fig__no">Fig.&nbsp;1</span> — From the front: the sensor mount, the breadboard behind it, the ESP32 module in its white holder on top. June 2026.</figcaption></figure>

The base is an Avular robot platform with two wheels. The PYNQ-Z2 sits on top in its case, with a TU/e prototype shield on its headers and a breadboard on the shield; the breadboard carries the NTC divider and the op-amp buffer. Everything the robot senses with is on a 3D-printed mount at the front: two TCRT5000 boards angled outward at the corners, their status LEDs lit in the photograph, the TCS3200 color board with its four white LEDs in the middle, and the VL53L0X time-of-flight boards stacked on the mount above them. The ESP32 connectivity module, which carries the MQTT link to the partner robot, sits in a white holder above the sensors.

<figure class="fig fig--right"><img class="fig__img fig__img--portrait" src="../assets/work/venus-bench-side.jpg" width="1125" height="2000" alt="The Venus rover from the side on the lab bench." loading="lazy" decoding="async"><figcaption><span class="fig__no">Fig.&nbsp;2</span> — From the side, on the same bench. June 2026.</figcaption></figure>

The stack at the front is three VL53L0X sensors at three heights: the bottom one sees the <span class="nb">3 cm</span> cubes, the middle one the <span class="nb">6 cm</span> cubes, the top one obstacles. That vertical arrangement is how the firmware tells a small cube from a large one: by which sensor reports it.
