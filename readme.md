Software Modules to be developed

To achieve above user scenarios, the following features needs to be implemented.
Each feature should be formed as a software development project.
Open Box App

Open Box app on tablet
Open Box app on Mobile phone
Auto-Upgrade OTA

Remotely auto-upgrade app on Tablet
Remotely auto-upgrade app on ROS board
Remotely auto-upgrade firmware on Arduino boards
Auto-Upgrade server on AWS and web GUI for operation
Each robot will be assigned an unique "robotId"
Upgrade by specified "robotId"
Control by Mobile App

Android app
iOS app
GUI to control base movement
GUI to control arms movement
Taipei team will develop ROS API and Denis's team will develop mobile apps
Telepresence

This is for remote participation scenario.
We MAY leverage "webrtc" technology to establish P2P video calls, which can penetrate most NATs/Firewalls.
App on Tablet
App on Mobile phone
Refer to http://www.doublerobotics.com/
Refer to KKuei's work: https://github.com/oudeis/therobot/tree/master/webrtcProject
Navigation & Obstacle Avoidance

This makes the robot to be able to go to a specified goal.
We will leverage ROS navigation stack,
Refer to: http://wiki.ros.org/navigation
SLAM Module

SLAM stands for "Simultaneous Localization and Mapping"
The robot must be able to construct and update a map on an unknown environment while simultaneously keeping track its location.
Must integrate with some sensors including:
LiDAR (the most important one)
Electronic compass
RGB-D sensors (ex. Kinect or XtionPro Live ...etc)
We will leverage ROS gmapping module
http://wiki.ros.org/gmapping?distro=indigo
We will develop a mobile app to display the map and user can specify where the robot to go.
Speech Interactions

This is something like "Siri" or "Okay, Google". We should make a "Okay, Andbot".
We can leverage several Android's services
https://developer.android.com/reference/android/service/voice/VoiceInteractionService.html
http://developer.android.com/reference/android/speech/SpeechRecognizer.html
Full speech conversation is too difficult. Instead, we can go dialog-based and retrieve limited commands by keywords
If necessary, the robot should respond with speech, e.g., "Yes, master" or "No problem".
We can leverage Android's TextToSpeech service
Refer to: http://developer.android.com/reference/android/speech/tts/TextToSpeech.html
Computer Vision and Object Recognition

The robot should be able to recognized "who" so that it can try to close to the "right" person.
We can leverage OpenCV template matching by preset face images
Refer to: http://docs.opencv.org/doc/tutorials/imgproc/histograms/template_matching/template_matching.html
The robot also must be able to recognize several specific objects, e.g., cups, bowls, door knob ...etc
Must be able to measure relative positions between the object and the robot.
Arms Trajectory Control

As above, once we know the relative positions, we can have wheels to move to close to the object or person.
Then we can leverage the inverse kinematics(IK) technology to have the robot arms and grasp to rotated to desired angles to get the object.
Even more, the robot can carry the object and put it to somewhere destinated.
We will leverage ROS MoveIt, http://moveit.ros.org/
Audo Docking

When the power is low, or the robot received command to go to base dock, it should automously move to the docking station to charge the power.
