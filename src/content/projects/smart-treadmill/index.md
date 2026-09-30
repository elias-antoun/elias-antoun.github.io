---
title: "Smart Treadmill with Health Monitoring"
summary: "A PIC16F877A programmed in assembly runs a treadmill prototype's speed, incline and distance, while an ESP32 reads heart rate and SpO₂ from a MAX30102 and sends them to it over UART."
featured: true
order: 67
tags: ["PIC Assembly", "ESP32", "UART", "Sensors"]
cover: ./cover.jpg
coverAlt: "The complete treadmill prototype on a labelled board: a breadboard with the PIC16F877A, LCD, control buttons and ESP32, an L298N motor driver, a power bank, a small fan and servo, and a cardboard treadmill whose black belt is driven by a yellow DC motor."
metrics:
  - value: "3 / 2"
    label: "PWM speeds / servo incline positions"
  - value: "9600 baud"
    label: "health data link, ESP32 to PIC"
---

A treadmill prototype with health monitoring, built with a teammate for the
Microprocessor Lab. Two controllers split the work.

A PIC16F877A, programmed in assembly, runs the treadmill. Five push buttons start it and
set speed and incline, CCP1 PWM drives the belt motor at three speed levels, a servo
raises the incline, and Timer1 overflows accumulate the distance. An LM35 read through
the ADC switches an alert fan on above 20 °C, and a 16×2 LCD shows everything.

![Close-up of the LCD reading BPM 84 and SpO2 91 above speed 1, incline 0, 0.1 km and 24 °C, with a finger on the pulse sensor.](./lcd-readout.jpg)

An ESP32 reads a MAX30102 pulse oximeter: SpO₂ from the ratio of its red and infrared
signals, and heart rate from peaks in the infrared signal. It shows both on a Wi-Fi
webpage, which also has an emergency-stop button that halts the treadmill, and sends them
to the PIC as a three-byte UART frame at 9600 baud. The frame starts with a 0xAA marker,
so the PIC can reject partial frames.

![The ESP32's webpage on a laptop, showing SpO2 91% and heart rate 88 BPM above an emergency-stop button.](./web-monitor.jpg)

The PIC checks the UART without blocking and recovers from overrun errors, so the
treadmill keeps responding while it waits for health data. The whole system was
simulated in Proteus before it was built.

![Proteus schematic of the complete treadmill circuit around the PIC16F877A.](./proteus-simulation.png)
