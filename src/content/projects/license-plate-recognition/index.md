---
title: "License Plate Recognition System"
summary: "Plate detection and character recognition in MATLAB, combining FFT-based encryption, edge detection, and correlation matching."
featured: true
order: 70
tags: ["MATLAB", "Image Processing", "Pattern Recognition"]
cover: ./app-cover.png
coverAlt: "The Car Plate Analyzer app in MATLAB showing a car's front with plate T 2020 at each stage: encrypted and decrypted, unsharp-masked, Wiener-filtered and edge-detected, then the extracted plate, its location, and the detected text T2020."
---

A detection and recognition system built with MATLAB App Designer. Plate regions are
located through edge detection, characters are segmented and extracted automatically, and
each is identified by correlation against a reference set.

The app shows every stage side by side: unsharp masking and a Wiener filter to clean up
the image, the edge map, the located and extracted plate, and the recognised text.

![The Car Plate Analyzer app in MATLAB showing a car's front with plate T 2020 at each stage: encrypted and decrypted, unsharp-masked, Wiener-filtered and edge-detected, then the extracted plate, its location, and the detected text T2020.](./app-stages.png)

The pipeline also applies FFT-based encryption and decryption to the captured image, tying
the frequency-domain work to a concrete purpose rather than treating it as an isolated
exercise.
