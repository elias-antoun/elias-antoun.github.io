---
title: "FIRE-X Fire-Fighting Robot"
summary: "An Arduino robot car that sweeps a flame sensor on a servo, turns toward the fire it finds, and puts it out with a water pump."
featured: true
order: 55
tags: ["Arduino", "Robotics", "Sensors", "Tinkercad"]
cover: ./cover.jpg
coverAlt: "The finished FIRE-X robot, a white box on four yellow wheels with an LCD on top, facing a lit lighter held just above the floor."
metrics:
  - value: "4.3 s"
    label: "average time from detection to moving"
  - value: "10 / 10"
    label: "test fires extinguished"
---

An autonomous fire-fighting robot car, built with two teammates for the Introduction to
Engineering Lab on an Arduino Uno. A flame sensor on an SG90 servo sweeps from 0 to 180°
in 10° steps. When a reading crosses the threshold, the car turns toward the sector the
flame was found in, drives up to it through an L298N motor driver, and runs a submersible
pump for two seconds, while an LCD shows "Searching for fire" and then "Fire detected!".

![Four photos in sequence: the LCD reading "Searching for fire", the flame sensor facing a lit lighter, the LCD reading "Fire detected!", and water spraying from the robot's tube onto the floor.](./sequence.webp)

The team scored a remote-controlled design against a fully autonomous one on a weighted
concept table, chose the autonomous one, and modelled the circuit and a 3D design in
Tinkercad before building it. In testing, the robot started moving 4.3 seconds after
detecting a flame on average, located the source within 15 cm, and put out all ten test
fires, from candles to small paper fires, within 30 seconds of spraying.

![Side view of the robot's 3D design in Tinkercad: the chassis and wheels, the electronics, a water tank and the spray arm.](./3d-design-side.png)

![Top view of the same 3D design, showing the motor driver, Arduino, LCD, battery and servo laid out on the chassis.](./3d-design-top.png)
