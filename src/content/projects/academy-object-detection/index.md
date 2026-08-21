---
title: "Academy Object Detection"
summary: "Warehouse object detection on the LOCO dataset, optimised for a Pareto-optimal trade-off between accuracy, model size, and compute."
featured: true
order: 20
tags: ["PyTorch", "Object Detection", "Knowledge Distillation"]
metrics:
  - value: "mAP@0.5"
    label: "maximised"
  - value: "params + GFLOPs"
    label: "minimised"
---

A PyTorch detector for warehouse objects, improved against three competing objectives at
once: raise mAP@0.5, reduce total parameter count, and reduce GFLOPs per image. The goal
was a Pareto-optimal result, one that no alternative dominates on all three axes
simultaneously.

Knowledge distillation transfers behaviour from a larger teacher into a compact student
model, which is then exported for deployment. Balancing the three objectives, rather than
chasing accuracy alone, is what makes the result usable on constrained hardware.
