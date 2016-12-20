# Aavaes-Robot-Software-project-Plan

## Control by Mobile App
* Android app
* iOS app
* GUI to control base movement

## Navigation & Obstacle Avoidance
* This makes the robot to be able to go to a specified goal.
* We will leverage ROS navigation stack,
* Refer to: http://wiki.ros.org/navigation

## SLAM Module
* SLAM stands for "Simultaneous Localization and Mapping"
* The robot must be able to construct and update a map on an unknown environment while simultaneously keeping track its location.
* Must integrate with some sensors including:
 * LiDAR (the most important one)
 * Electronic compass
 * RGB-D sensors (ex. Kinect or XtionPro Live ...etc)
* We will leverage ROS gmapping module
 * http://wiki.ros.org/gmapping?distro=indigo
* We will develop a mobile app to display the map and user can specify where the robot to go.


## Speech Interactions
* This is something like "Siri"
* We can leverage several Android's services
 * https://developer.android.com/reference/android/service/voice/VoiceInteractionService.html
 * http://developer.android.com/reference/android/speech/SpeechRecognizer.html
* Full speech conversation is too difficult. Instead, we can go dialog-based and retrieve limited commands by keywords 
 * We can leverage Android's TextToSpeech service 
 * Refer to: http://developer.android.com/reference/android/speech/tts/TextToSpeech.html


## Computer Vision and Object Recognition
* The robot should be able to recognized "who" so that it can try to close to the "right" person.
* We can leverage OpenCV template matching by preset face images
 * Refer to: http://docs.opencv.org/doc/tutorials/imgproc/histograms/template_matching/template_matching.html
* The robot also must be able to recognize several specific objects, e.g., cups, bowls, door knob ...etc
* Must be able to measure relative positions between the object and the robot.


## Audo Docking
* When the power is low, or the robot received command to go to base dock, it should automously move to the docking station to charge the power.

