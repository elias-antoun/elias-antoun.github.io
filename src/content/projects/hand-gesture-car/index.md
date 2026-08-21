---
title: "Hand Gesture Controlled Robotic Car"
summary: "Real-time hand-gesture recognition driving a wireless robotic car, with a Python GUI for live monitoring."
featured: true
order: 60
tags: ["Python", "OpenCV", "Mediapipe", "Embedded"]
---

An interactive motor control system built on OpenCV and Mediapipe. Hand landmarks are
tracked from a live camera feed, classified into discrete gestures, and translated into
motor commands sent wirelessly to a NodeMCU on the vehicle.

A Python GUI displays the recognised gesture and the resulting command as they happen,
which turned out to be essential for debugging: gesture misclassification is far easier
to diagnose when the intermediate state is visible rather than inferred from how the car
moved.
