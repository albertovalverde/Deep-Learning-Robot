# Aavaes-virtual assistant_optician_assistant-Software-Development-Plan

# Introduction
* This document describes on-shop virtual_optician_assistant-Software module list and development plan.
* The virtual assistant is not designed or intended to replace human beings, which helps to contribute to his integration. 

# Features:
* ATTRACTING. The virtual assistant can create traffic in optician physical locations. It offers a unique experience, richer than online. Benefits: increasing footfall, promoting an innovative image, raising brand visibility.
* WELCOMING. The virtual assistant is able to welcome and assist customers through the first stages of their visit. Benefits: standing out through innovation, managing and regulating peak attendance periods, raising the profile of the brand.
* ENTERTAINING. The virtual assistant offers a truly unusual customer experience. Benefits: increasing footfall, boosting brand affinity.
* GUIDING. The virtual assistant can guide towards locations, services or products, and help people to find what they’re looking for. Benefits: reducing staff workload, personalised services, improved management and sales tracking.
* VISION TEST. The virtual assistant is able to test customer vision. https://www.essilor.com/en/vision-tests/test-your-vision/
* OPTICIAN ASSISTANT. The virtual assistant quickly captures photos and/or videos of the patient wearing their chosen frame(s) and provides simple on-screen review tools to assist them in making a final decision. https://itunes.apple.com/us/app/idispense/id857740969?mt=8
* INFORMING AND RECOMMENDING PRODUCTS. The virtual assistant is able to inform and offer recommendations about products and services. virtual assistant can participate in loyalty programmes. It recommends products and services in a personalised manner, adapted to the customer's profiles and purchasing history. Benefits: harmonising the cross/omni-channel experience, assisting sales and sales teams, boosting sales, improved management and sales tracking.
* VIRTUAL REALITY INTEGRATION. The virtual assistant is ready to integrate with VR project for human virtual assistant interaction that allows any lens wearer to experience the benefits of their new spectacle lenses before ordering then. https://www.youtube.com/watch?v=oOdTWCwf9lg
* IMPROVING CUSTOMER KNOWLEDGE - AI IN BUSINESS. The virtual assistant can measure customer satisfaction, study customer opinions in the form of satisfaction indexes or verbatim audio or text in response to open and closed questions. The virtual assistant is able to refine the analysis of these opinions thanks to customer data such as gender, age or mood. Benefits: quality and reliability of data, deeper knowledge of the customers, storage and analysis of data in real time.


# High-Level User Scenarios

## Open Box
* Tablet app say hello to the world and guide the user to download mobile app on phone and subsequent setup procedures
* User uses mobile app to connect to virtual assistant via BT and provisioning WiFi configurations to Aavaes-virtual assistant_optician_assistant (Tablet & ROS board)
* User uses mobile app to command the virtual assistant's base movement
* User uses mobile app to command the virtual assistant's arms movement 

## Auto-Upgrade OTA(over the air)
* Tablet as GUI 
* virtual assistant automatically check for latest updates and download firmware in background
* When firmware downloaded, prompt messages to user to confirm the upgrade execution

## Open Box App
* Open Box app on kiosk

## Auto-Upgrade OTA 
* Remotely auto-upgrade app on Tablet
* Remotely auto-upgrade app on ROS board
* Remotely auto-upgrade firmware on Arduino boards
* Auto-Upgrade server on AWS and web GUI for operation
* Each virtual assistant will be assigned an unique "virtual assistantId"
* Upgrade by specified "virtual assistantId"

# System Architecture
* Here is the proposed system architecture: 
* All the intelligent modules will be on kiosk board.

![](http://aavaes.com/wp-content/uploads/2017/03/essilor-cognition-bloks.png)

[Proposed Architecture](http://aavaes.com/wp-content/uploads/2017/03/essilor-cognition-bloks.png)



# Software Modules to be developed
## Server Backend. FullRest API for business logic. Digital signage management and Business intelligence.
* Node.js, 
* Express 
* MongoDB

## App for the tablet for user interface & rich user experience. Vision test, optician assistant, informing and recommending product, virtual reality, etc
 * Node.js
 * Html5, CSS3 and JavaScript. Angular.js and React.js	


## Speech Interactions
* This is something like "Siri"
* We can leverage several Android's services
 * https://developer.android.com/reference/android/service/voice/VoiceInteractionService.html
 * http://developer.android.com/reference/android/speech/SpeechRecognizer.html
* Full speech conversation is too difficult. Instead, we can go dialog-based and retrieve limited commands by keywords 
 * We can leverage Android's TextToSpeech service 
 * Refer to: http://developer.android.com/reference/android/speech/tts/TextToSpeech.html


## Computer Vision and Object Recognition
* The virtual assistant should be able to recognized "who" so that it can try to close to the "right" person.
* We can leverage OpenCV template matching by present face images
 * Refer to: http://docs.opencv.org/doc/tutorials/imgproc/histograms/template_matching/template_matching.html
* The virtual assistant also must be able to recognize several specific objects, e.g., frames, VR glasses, door knob ...etc
* Must be able to measure relative positions between the object and the virtual assistant.

* Proof of concept: 
  * https://www.youtube.com/watch?v=gLMsUSmbo7M
  * https://www.youtube.com/watch?v=UH02ASIJ9gw&t=39s
  * https://www.youtube.com/watch?v=KvmkGbMgvaU

