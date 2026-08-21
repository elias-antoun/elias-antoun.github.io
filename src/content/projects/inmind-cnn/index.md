---
title: "InMindCNN"
summary: "CIFAR-10 image classification in PyTorch, taken from a LeNet-5 baseline to 98.24% through a documented ablation sequence."
featured: true
order: 10
tags: ["PyTorch", "CNN", "Computer Vision"]
metrics:
  - value: "64.97% → 98.24%"
    label: "test accuracy"
  - value: "4"
    label: "architectures benchmarked"
---

Four architectures were trained and compared under a consistent harness: a LeNet-5
baseline, a CIFAR ResNet-18 trained from scratch, a finetuned ImageNet ResNet-18, and a
finetuned EfficientNet-B0. Each run records parameter count, input resolution, epochs,
test accuracy, and wall-clock time, so accuracy gains can be weighed against their
compute cost rather than reported in isolation.

Every configuration is committed as a YAML file, which made the ablation sequence
reproducible — and in one case allowed the outcome of a change to be predicted in the
config before the run was executed.
