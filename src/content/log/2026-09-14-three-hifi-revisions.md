---
title: "Three revisions of the HiFi board"
date: 2026-09-14
summary: "The player board has been laid out three times. The renders, oldest to newest: a small board with one rotary control, a larger one that adds Bluetooth and the ESP32, and the current layout with the power section in the middle."
tags: ["hifi-player", "pcb"]
---

The board for the [battery-powered HiFi player](../work/hifi-player.html) has been laid out three times since May. The three renders below are the three revisions, oldest to newest; the ICs are not named here because the renders only label packages.

<figure class="fig fig--right"><img class="fig__img" src="../assets/work/hifi-rev1.png" width="766" height="559" alt="Rendered layout of the first revision: a small board with two buttons, a USB-C connector, a 3.5 mm jack, a large rotary control and a 4-pin header." loading="lazy" decoding="async"><figcaption><span class="fig__no">Fig.&nbsp;1</span> — Revision 1: two buttons, USB-C, a 3.5 mm jack, one large rotary control and a 4-pin header (render).</figcaption></figure>

The first revision is a small board with two buttons, a USB-C connector, a 3.5 mm jack, one large rotary control and a 4-pin header. There is no radio module and no card slot on it.

<figure class="fig fig--right"><img class="fig__img" src="../assets/work/hifi-rev2.png" width="939" height="699" alt="Rendered layout of the second revision: a larger board with a shielded Bluetooth module and its crystal, four buttons, a microSD slot, and the ESP32-S3R8 with its crystal." loading="lazy" decoding="async"><figcaption><span class="fig__no">Fig.&nbsp;2</span> — Revision 2: a shielded Bluetooth module with its own crystal, four buttons, a microSD slot, and the ESP32-S3R8 with its crystal (render).</figcaption></figure>

The second revision is larger and adds the two sources. A shielded Bluetooth module with its own crystal sits on the board, the buttons go from two to four, a microSD slot appears, and the ESP32-S3R8 is placed with its crystal next to it.

<figure class="fig fig--right"><img class="fig__img" src="../assets/work/hifi-rev3.png" width="1415" height="989" alt="Rendered layout of the third revision: four mounting holes; the Bluetooth module and the ESP32 on the left; the DAC section and the 3.5 mm jack top right; two electrolytic capacitors and the power section in the middle; USB-C, microSD and a JST battery connector along the bottom edge; a 7-pin header for a screen at the top." loading="lazy" decoding="async"><figcaption><span class="fig__no">Fig.&nbsp;3</span> — Revision 3, the current layout: module and ESP32 on the left, DAC and jack top right, power in the middle, connectors along the bottom edge, a 7-pin screen header at the top (render).</figcaption></figure>

The third revision is the current layout. It has four mounting holes. The Bluetooth module and the ESP32 are on the left; the DAC section and the 3.5 mm jack are top right; two electrolytic capacitors and the power section sit in the middle of the board; the USB-C connector, the microSD slot and a JST battery connector run along the bottom edge; and a 7-pin header for a screen is at the top. Nothing on any of the three has been bench-verified yet; the case study says the same, and will until a board plays music from both sources on battery.
