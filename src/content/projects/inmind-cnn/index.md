---
title: "InMindCNN"
summary: "CIFAR-10 image classification in PyTorch, taken from the assignment's LeNet-5-style template to 98.24% through a documented ablation sequence."
featured: true
order: 10
tags: ["PyTorch", "CNN", "Computer Vision"]
cover: ./cover.png
coverAlt: "Bar chart of CIFAR-10 test accuracy by model: the SimpleNet template at 64.97%, ResNet-18 and EfficientNet-B0 between 95.28% and 96.96%, and EfficientNet-B4 reaching 97.68% at 160px and 98.24% at 224px."
metrics:
  - value: "64.97% → 98.24%"
    label: "test accuracy"
  - value: "4"
    label: "architectures benchmarked"
---

Four architectures were trained and compared under a consistent harness: the
assignment's LeNet-5-style template, SimpleNet (62K parameters), ResNet-18 both trained
from scratch and finetuned from ImageNet, and ImageNet-pretrained EfficientNet-B0 and
B4. Each run records parameter count, input resolution, epochs, test accuracy, and
wall-clock time, so accuracy gains can be weighed against their compute cost rather than
reported in isolation.

![Bar chart of CIFAR-10 test accuracy by model: the SimpleNet template at 64.97%, ResNet-18 finetuned at 95.28% and from scratch at 96.32%, EfficientNet-B0 at 96.96%, and EfficientNet-B4 at 97.68% with 160px input and 98.24% with 224px.](./test-accuracy.png)

The from-scratch ResNet-18 needs 200 epochs to finish at 96.32%. The pretrained
backbones are finetuned for 15 to 30 epochs, and the EfficientNets pass 91% after their
first.

![Line chart of validation accuracy over the first 30 epochs of five runs. The pretrained EfficientNets start between 91% and 95% and level off between 97% and 99%; the finetuned ResNet-18 climbs from 65% to about 95.6%; the from-scratch ResNet-18 rises unevenly to about 88% by epoch 30.](./training-runs.png)

Every configuration is committed as a YAML file, which made the ablation sequence
reproducible — and in one case allowed the outcome of a change to be predicted in the
config before the run was executed. Raising EfficientNet-B4's input resolution from
160px to 224px, with the same recipe and 20 epochs, was predicted to land between 98.0%
and 98.4%. It reached 98.24% on test, up from 97.68%.

![Line chart comparing EfficientNet-B4 at 160px and 224px input over 20 epochs: the 224px run leads by 4.2 points after one epoch, passes the 160px run's final accuracy by epoch 3, and finishes at 98.24% test accuracy against 97.68%.](./resolution-ablation.png)

Of the 175 test images the final model still gets wrong, 43% are cat–dog or
automobile–truck confusions.

![Confusion matrix of the final model's 175 errors with the diagonal suppressed. The largest cells are cat predicted as dog (25), dog as cat (27), automobile as truck (11) and truck as automobile (12).](./confusion-matrix.png)
