---
title: "Pinball Scoring and Drain System"
summary: "An analog scoring system for a team-built pinball machine: a piezo sensor grades each hit, timer circuits run a water pump to raise the score, and an infrared beam drains it when a ball is lost."
featured: true
order: 65
tags: ["Analog Circuits", "Op-Amps", "555 Timers", "Sensors"]
cover: ./cover.jpg
coverAlt: "Top-down view of the team-built pinball board: a white playfield with two round bumpers, two triangular slingshots and a curved guide rail."
metrics:
  - value: "×10"
    label: "op-amp gain on the piezo signal"
  - value: "2 s / 4 s"
    label: "pump time per light / hard hit"
---

The scoring and drain subsystem of a pinball machine built by a team for the Electronic
Circuits Lab, where the player's score is the water level in a tank. It uses no
microcontroller: sensing, grading and timing are all analog circuits.

A piezoelectric plate on the bumper picks up each ball impact. Its 0–0.7 V output is
amplified tenfold by an inverting µA741 stage, clamped to 0–5 V with diodes, and smoothed
to a DC level by a half-wave rectifier. Two LM393 comparators with 3 V and 4 V references
grade the hit: the low comparator alone means a light hit, both together a hard one.

![The complete scoring and drain circuit wired across breadboards, with a blue LED lit.](./scoring-circuit.jpg)

Each grade triggers one half of a 556 dual timer, a 2-second pulse for a light hit and
4 seconds for a hard one. The two outputs are combined through diodes into an L298N
H-bridge that drives a 12 V submersible pump filling the scoring tank.

When a ball drains, it breaks an infrared beam between two facing modules. The inverted
signal fires a 555 timer for 2 seconds, switching a relay that opens a 12 V solenoid
valve and lets water out, lowering the score.

![Top-down view of the team-built pinball board: a white playfield with two round bumpers, two triangular slingshots and a curved guide rail.](./pinball-board.jpg)
