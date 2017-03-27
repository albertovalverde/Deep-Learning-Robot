# Aavaes-Robot_optician_assistant-Software-Development-Plan

# Introduction
* This document describes Aavaes-Robot_optician_assistant-Software module list and development plan.
* The Robot is not designed or intended to replace human beings, which helps to contribute to his integration. 

# Features:
* ATTRACTING. The Robot can create traffic in optician physical locations. It offers a unique experience, richer than online. Benefits: increasing footfall, promoting an innovative image, raising brand visibility.
* WELCOMING. The robot is able to welcome and assist customers through the first stages of their visit. Benefits: standing out through innovation, managing and regulating peak attendance periods, raising the profile of the brand.
* ENTERTAINING. The robot offers a truly unusual customer experience. Benefits: increasing footfall, boosting brand affinity.
* GUIDING. The Robot can guide towards locations, services or products, and help people to find what they’re looking for. Benefits: reducing staff workload, personalised services, improved management and sales tracking.
* VISION TEST. The robot is able to test your vision using something like this. https://www.essilor.com/en/vision-tests/test-your-vision/
* OPTICIAN ASSISTANT. The Robot quickly captures photos and/or videos of the patient wearing their chosen frame(s) and provides simple on-screen review tools to assist them in making a final decision. https://itunes.apple.com/us/app/idispense/id857740969?mt=8
* INFORMING AND RECOMMENDING PRODUCTS. The robot is able to inform and offer recommendations about products and services. Robot can participate in loyalty programmes. It recommends products and services in a personalised manner, adapted to the customer's profiles and purchasing history. Benefits: harmonising the cross/omni-channel experience, assisting sales and sales teams, boosting sales, improved management and sales tracking.
* VIRTUAL REALITY INTEGRATION. The robot is ready to integrate with VR project for human robot interaction that allows any lens wearer to experience the benefits of their new spectacle lenses before ordering then. https://www.youtube.com/watch?v=oOdTWCwf9lg
* IMPROVING CUSTOMER KNOWLEDGE - AI IN BUSINESS. The robot can measure customer satisfaction, study customer opinions in the form of satisfaction indexes or verbatim audio or text in response to open and closed questions. The robot is able to refine the analysis of these opinions thanks to customer data such as gender, age or mood. Benefits: quality and reliability of data, deeper knowledge of the customers, storage and analysis of data in real time.


# High-Level User Scenarios

## Open Box
* Tablet app say hello to the world and guide the user to download mobile app on phone and subsequent setup procedures
* User uses mobile app to connect to robot via BT and provisioning WiFi configurations to Aavaes-Robot_optician_assistant (Tablet & ROS board)
* User uses mobile app to command the robot's base movement
* User uses mobile app to command the robot's arms movement 

## Auto-Upgrade OTA(over the air)
* Tablet as GUI 
* Robot automatically check for latest updates and download firmware in background
* When firmware downloaded, prompt messages to user to confirm the upgrade execution

## Open Box App
* Open Box app on tablet
* Open Box app on Mobile phone

## Auto-Upgrade OTA 
* Remotely auto-upgrade app on Tablet
* Remotely auto-upgrade app on ROS board
* Remotely auto-upgrade firmware on Arduino boards
* Auto-Upgrade server on AWS and web GUI for operation
* Each robot will be assigned an unique "robotId"
* Upgrade by specified "robotId"

## Control by Mobile App
* Android app
* iOS app
* GUI to control base movement
* GUI to control arms movement 

# System Architecture
* Here is the proposed system architecture: 
* All the intelligent modules will be on tablet or on ROS board.

![](https://aavaes.com/wp-content/uploads/2017/03/architecture.png)

[Proposed Architecture](http://aavaes.com/wp-content/uploads/2017/03/architecture.png)



# Software Modules to be developed
## Server Backend. FullRest API for business logic. Digital signage management and Business intelligence.
* Node.js, 
* Express 
* MongoDB

## App for the tablet for user interface & rich user experience. Vision test, optician assistant, informing and recommending product, virtual reality, etc
 * Node.js
 * Html5, CSS3 and JavaScript. Angular.js and React.js	

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
* We can leverage OpenCV template matching by present face images
 * Refer to: http://docs.opencv.org/doc/tutorials/imgproc/histograms/template_matching/template_matching.html
* The robot also must be able to recognize several specific objects, e.g., frames, VR glasses, door knob ...etc
* Must be able to measure relative positions between the object and the robot.

* Proof of concept: 
  * https://www.youtube.com/watch?v=gLMsUSmbo7M
  * https://www.youtube.com/watch?v=UH02ASIJ9gw&t=39s
  * https://www.youtube.com/watch?v=KvmkGbMgvaU


## Auto Docking
* When the power is low, or the robot received command to go to base dock, it should autonomously move to the docking station to charge the power.