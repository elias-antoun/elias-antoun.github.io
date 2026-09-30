---
title: "Robot Perception Manager"
summary: "A ROS 2 perception system integrating actions, services, publish/subscribe, and TF2 with custom interface definitions."
featured: true
order: 40
tags: ["ROS 2", "C++", "TF2"]
links:
  repo: "https://github.com/elias-antoun/Robot_Perception_Manager"
---

Two nodes cooperate. `perception_manager` runs detections on demand, driven by an action
goal so that long-running work reports progress and can be cancelled.
`camera_tf_broadcaster` publishes the static camera transform once at startup, giving
detections a frame to be expressed in.

![Output of ros2 tf2_tools view_frames: a single static transform from base_link to camera_optical_frame.](./tf-tree.png)

The action server is also preemptable. A new goal arriving mid-run aborts the current one,
whose client receives `success: false`, and the new goal starts executing in the same
process, with no restart.

![Terminal output of the first action goal: feedback at 10 fps with detections counting up to 1,323, then success: false and "Goal finished with status: ABORTED" as a second goal takes over.](./preemption-log.png)

The package defines its own interfaces rather than reusing generic messages: a
`StartDetection` action, a `Detection` message, and a `SetConfidenceThreshold` service.
Choosing the right ROS 2 communication primitive for each interaction — action for
long-running goals, service for synchronous configuration, topic for streams — is the
substance of the exercise.
