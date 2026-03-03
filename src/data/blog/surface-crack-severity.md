---
author: Varad Rane
pubDatetime: 2022-08-14T10:00:00Z
title: "Detecting and Classifying Surface Crack Severity with Deep Learning"
slug: surface-crack-severity-detection
featured: true
draft: false
tags:
  - machine-learning
  - computer-vision
  - research
  - tensorflow
  - yolo
  - android
description: >
  Research published in Springer's ICACIT 2022 proceedings. We trained models to classify the severity of structural surface cracks from video, compared binary classification against YOLOv5 object detection, and deployed the model on Android.
---

Structural cracks in walls and buildings range from cosmetic annoyances to genuine safety hazards — but telling them apart by eye is inconsistent and subjective. We set out to build a system that could do it reliably from a video feed.

This work was published in [**Advanced Computing and Intelligent Technologies, Proceedings of ICACIT 2022**](https://link.springer.com/chapter/10.1007/978-981-19-2980-9_21) by Springer.

## Table of contents

## The Problem

Surface cracks are common indicators of structural health. But severity is a spectrum — a hairline crack in a plaster wall is very different from a wide crack propagating through load-bearing concrete. Current assessment relies on manual inspection: someone walks around, looks at cracks, and makes a judgment call. This is:

- **Inconsistent** across inspectors
- **Time-consuming** for large structures
- **Impractical** for continuous monitoring

We wanted to automate severity classification using computer vision, starting from a video feed.

## Dataset & Annotation

No suitable labeled dataset existed for crack severity classification (as opposed to mere crack detection), so we built our own.

We collected video footage of cracked surfaces across different materials and conditions, then manually annotated each frame with severity labels. Our label taxonomy:

- **Low severity** — Hairline or narrow cracks, cosmetic concern
- **Medium severity** — Moderate width or length, warrants monitoring
- **High severity** — Wide, deep, or propagating cracks, structural risk

Consistent labeling criteria were essential — annotators were calibrated against a shared rubric to reduce inter-annotator variance. This was the most time-intensive part of the project.

## Approach 1: Binary Classification on Video Frames

Our first approach treated severity classification as a frame-level classification problem. We extracted frames from the video feed and ran them through a CNN classifier.

The binary model (crack / no crack first, then severity class) used transfer learning on a pre-trained backbone fine-tuned on our dataset.

```python
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet'
)
base_model.trainable = False

model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(3, activation='softmax')  # 3 severity classes
])
```

Training on the annotated dataset, the model learned to differentiate severity levels with reasonable accuracy. Temporal smoothing over consecutive frames reduced prediction jitter in the live video feed.

## Approach 2: YOLOv5 for Object Detection

For comparison, we also implemented **YOLOv5** — a real-time object detection model. Rather than classifying the whole frame, YOLOv5 localizes cracks within the frame and classifies each detected region independently.

This approach offers:
- **Bounding box output** — You know not just that a crack exists, but exactly where in the frame
- **Multiple detections per frame** — Useful when a surface has cracks of different severities in the same shot
- **Confidence scores** per detection for thresholding

We re-annotated a portion of the dataset with bounding boxes for YOLOv5 training. The additional localization information proved valuable for real-world inspection scenarios where a frame might contain multiple crack instances.

## Android Deployment

Deploying to a mobile device was a key goal — inspectors in the field shouldn't need a laptop or API connectivity to use the tool.

We converted the YOLOv5 model to TensorFlow Lite and built an Android app that:

1. Captures frames from the device camera in real time
2. Runs TFLite inference on-device
3. Overlays detected regions with severity labels on the live camera view

On-device inference with TFLite ran fast enough for usable real-time feedback on mid-range Android hardware.

## Results and Comparison

| Metric | Classification Model | YOLOv5 |
|--------|---------------------|--------|
| Inference speed | Fast (frame-level) | Fast (real-time capable) |
| Localization | No | Yes (bounding boxes) |
| Multi-crack per frame | No | Yes |
| Deployment complexity | Low | Medium |

The classification model had higher raw accuracy on severity prediction when cracks were cleanly centered. YOLOv5 performed better in realistic conditions with partial frames, occlusion, and multiple cracks in view.

For the field application, YOLOv5's localization capability made it the more practical choice despite the higher complexity.

## What I Learned

**Dataset quality dominates model quality.** The performance ceiling was set by how consistently we annotated, not by the model architecture. Spending more time on calibrated annotation criteria was the highest-leverage thing we did.

**Transfer learning is remarkably effective for domain adaptation.** Pre-trained ImageNet weights gave us a strong starting point even though the domain (structural cracks) is quite different from the ImageNet distribution. The model adapted quickly with relatively few domain-specific examples.

**Mobile deployment imposes real constraints.** Quantizing models for TFLite introduces accuracy-speed tradeoffs that you have to navigate explicitly. The right tradeoff depends on your latency requirements and the accuracy tolerance of the application.

**Comparison studies are underrated.** Running two different approaches on the same dataset and task gave us much more insight than either approach alone. The architectural differences explained different failure modes in a way that informed both models.

## Publication

The full paper is available via Springer:
[Surface Cracks Severity Detection and Classification — ICACIT 2022](https://link.springer.com/chapter/10.1007/978-981-19-2980-9_21)
