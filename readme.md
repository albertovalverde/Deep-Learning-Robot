# Aavaes-Robot-Software-project-Plan

## Robot User interface and Digital Signage application for commercial purposes.
* Tablet app to guide the user to download mobile app on phone and subsequent setup procedures
* User uses mobile app to connect to robot via BT and provisioning WiFi configurations to the robot (Tablet & ROS board)
* Digital Signage player:
 * Node.js
 * Html5, CSS3 and javascript
 
## Content management platform for Digital Signage funtionallity
* Server (API) Express.js
* Frontend Angular.js + react.js

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

* Proof of concept: 
  * https://www.youtube.com/watch?v=gLMsUSmbo7M
  * https://www.youtube.com/watch?v=UH02ASIJ9gw&t=39s
  * https://www.youtube.com/watch?v=KvmkGbMgvaU


## Auto Docking
* When the power is low, or the robot received command to go to base dock, it should automously move to the docking station to charge the power.

