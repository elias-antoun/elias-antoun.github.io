---
title: "Multi-Sensor IMU Pipeline"
summary: "A three-node ROS 2 Jazzy pipeline that simulates IMU data, applies a moving-average filter, and logs raw against filtered output."
featured: true
order: 30
tags: ["ROS 2", "C++", "Sensor Fusion"]
links:
  repo: "https://github.com/elias-antoun/Multi-Sensor-Pipeline"
---

Three cooperating ROS 2 nodes: a sensor driver publishing simulated IMU readings to
`/imu/raw`, a filter node applying a moving average and republishing to `/imu/filtered`,
and a logger subscribing to both topics to emit a raw-versus-filtered comparison every
second.

The pipeline is configured through a YAML parameter file and started from a single launch
file, so filter window size and publish rates can be varied without recompiling. It is a
deliberately small system built to get the ROS 2 fundamentals right: topic design,
parameterisation, and launch composition.
