

define(["jquery"], function($) {

	$(function() {

	    var main = {
		        
		    init: function(){

		    	$('h1').append(' : jquery DOM loaded');
		    	initRobotUI();
		    	speak();
		 
    
		    //	initMedia();

		    }		    
	    }
	    main.init();
	    
	  

	});

});



function initRobotUI() {
		stage = new createjs.Stage("canvas1");
		
        
       var eyeLeft = new createjs.Shape();
		eyeLeft.graphics.beginFill("#000").drawCircle(300, 100, 45);

		        
       var eyeRight = new createjs.Shape();
		eyeRight.graphics.beginFill("#000").drawCircle(500, 100, 45);
        
        //Mouth
        

        var g = new createjs.Shape();
		g.graphics.setStrokeStyle(10, 'round', 'round');
		g.graphics.beginStroke("#000");
		g.graphics.beginFill("#FC0");
//		g.graphics.drawCircle(0, 50, 200); //55,53

//		//Mouth
		g.graphics.beginFill(); // no fill
		g.graphics.arc(200, 0, 200, 0, Math.PI);
        g.x = 200;
        g.y = 250;
        
        
        
//        var mouth = new createjs.Shape();
//		mouth.graphics.beginFill("#fff").arc(200, 400, 20, 0, Math.PI);
//	
        
//        var mouth = new createjs.Shape();
//		mouth.graphics.beginFill("#000000").drawRect(200, 250, 200, 50);
        
//        var  poly = new createjs.Shape(),
//        s = 120,
//        h = s * (Math.sqrt(3)/2),
//        x = 300,
//        y = 250;

       /* poly.graphics.beginFill('#fff').setStrokeStyle(75);
        poly.graphics.moveTo(x,y).lineTo(x+s/2,y+h).lineTo(x-s/2,y+h).closePath();*/
        

		/*var highlight = new createjs.Shape();
		highlight.graphics.beginFill("#FFFF66").drawRect(-50, -5, 100, 30);
		highlight.x = 250;
		highlight.y = 250;
*/
		/*var txt = new createjs.Text("TweenJS", "bold 20px Arial");
		txt.textAlign = "center";
		txt.x = 250;
		txt.y = 250;*/
        
       
        
//		s.y = canvas.height / 2;
		stage.addChild(g,eyeLeft, eyeRight);
       //stage.addChild(circle, highlight);
        
       
//        createjs.Tween.get(eyeLeft,{loop: true}).wait(3000).to({alpha: 0},0);

		// set up a tween that tweens between scale 0.3 and 1 every second.
		createjs.Tween.get(eyeLeft, {loop: true})
				.wait(3000) // wait for 1 second
				.to({alpha: 0}) // jump to the new scale properties (default duration of 0)
				.wait(50)
				.to({alpha: 1}, 50, createjs.Ease.bounceOut) // tween to scaleX/Y of 1 with ease bounce out
        
        // set up a tween that tweens between scale 0.3 and 1 every second.
		createjs.Tween.get(eyeRight, {loop: true})
				.wait(3000) // wait for 1 second
				.to({alpha: 0}) // jump to the new scale properties (default duration of 0)
				.wait(50)
				.to({alpha: 1}, 50, createjs.Ease.bounceOut) // tween to scaleX/Y of 1 with ease bounce out

		// for demonstration purposes, try setting the override (fourth) parameter to true
		// this will override any previous tweens on the circle and replace them with this tween
		// resulting in the scaling tween above being cleared.
        
        /*
		createjs.Tween.get(circle, {loop: true}, null, false) // get a new tween targeting circle
				.to({x: 500, y: 200, alpha: 0.1}, 1000, createjs.Ease.get(1)) // tween x/y/alpha properties over 1s (1000ms) with ease out
				.to({x: 0}, 1000, createjs.Ease.get(-1)) // tween x over 0.5s with ease in
				.to({y:350}) // jump to new y property (defaults to a duration of 0)
				.call(console.log, ["wait..."], console) // call console.log("wait...")
				.wait(700) // wait for 0.8s
				.to({y: 0, alpha: 1}, 300) // tween y/alpha over 0.3s
				.call(console.log, ["done!"], console) // call console.log("done!");
*/
        
		// this tween doesn't actually tween anything, it just sequences some actions:
		// note that it has pauseable set to false, so it will keep playing even when Ticker is paused.
        /*
		createjs.Tween.get(txt, {loop: true, ignoreGlobalPause: true}) // get a tween targeting txt
				.to({text: "the new javascript tweening engine"}, 1500) // change text after 1.5s
				.set({visible: false}, highlight) // set visible=false on highlight
				.to({text: "by Grant Skinner, gskinner.com"}, 1500) // change text after 1.5s
				.to({text: "TweenJS"}, 1500).set({visible: true}, highlight); // change text after 1.5s & set visible=true on highlight
                
                */
        
        
		/*
		 // We could also do the above using wait and set:
		 .wait(1500) // wait 1.5s
		 .set({visible:false},highlight) // set visible=false on highlight
		 .set({text:"the new javascript tweening engine"}) // set the text property of the target
		 .wait(1500).set({text:"by Grant Skinner, gskinner.com"}) // wait 1.5s & update text
		 .wait(1500).set({text:"TweenJS"}).set({visible:true},highlight); // etc.
		 */

	
		
		
		
	}
	
	
	function speak()
	{
		
		createjs.Ticker.setFPS(20);
		// in order for the stage to continue to redraw when the Ticker is paused we need to add it with
		// the second ("pauseable") param set to false.
		createjs.Ticker.addEventListener("tick", stage);
		
		
		
		
		meSpeak.loadConfig("mespeak_config.json");
		meSpeak.loadVoice('es.json');

		if (annyang) {
  
 
  
	  		var commands = {
	  			
			'hola me llamo *Alberto': function(tag) {
	    
		    	var eyeLeft2 = new createjs.Shape();
				eyeLeft2.graphics.beginFill("#000").drawCircle(300, 100, 45);
		
						
							createjs.Ticker.setFPS(20);
				// in order for the stage to continue to redraw when the Ticker is paused we need to add it with
				// the second ("pauseable") param set to false.
				createjs.Ticker.addEventListener("tick", stage);
				
					stage.addChild(g,eyeLeft2);
		   
				meSpeak.speak('hola que tal?   ' +tag);
		   
    
      
			 },
    
			 'hello': function(){
   	
			 	var eyeLeft2 = new createjs.Shape();
				eyeLeft2.graphics.beginFill("#fff").drawCircle(300, 100, 45);
						
				createjs.Ticker.setFPS(20);
				// in order for the stage to continue to redraw when the Ticker is paused we need to add it with
				// the second ("pauseable") param set to false.
				createjs.Ticker.addEventListener("tick", stage);
				
				stage.addChild(g,eyeLeft2);
					
		   		meSpeak.speak('perdon' );
		   	
			  }
    
			 };
  
  

		  // Add our commands to annyang
		  annyang.addCommands(commands);
		
		  // Start listening. You can call this here, or attach this call to an event, button, etc.
		  annyang.start();
		  //speak('hello, I am Pity');
 

		}
		
		
	};
	
	
	
// Function: Initialisation after document has been loaded.
	function initMedia() {
		
	//	var elementID = 'canvas' + $('canvas').length; // Unique ID
		
		var elementID = 'SWCanvasPlayer';

		$('<canvas>').attr({
		    id: elementID
		}).css({
		    width: '100%',
		    height: '100%'
		}).appendTo('#container');
		
		 $("#SWCanvasPlayer").addClass("baseCanvas");

//var canvas = document.getElementById(elementID); // Use the created element

	
	    var gBaseCanvasStage;
	    var gFramesPerSecond;
	    var lBaseCanvas = $("#SWCanvasPlayer")[0];
	    gBaseCanvasStage = new createjs.Stage(lBaseCanvas);

	    // Lets make sure that we can see our canvas DIV
	    $('#container').show();

	    // Ticker setup;
	    createjs.Ticker.setFPS(32); // Setting the FPS.

	    // Make sure the stage gets called for tick events
	    createjs.Ticker.addEventListener("tick", gBaseCanvasStage);
	    // to get onMouseOver & onMouseOut events, we need to enable them on the stage:
	    gBaseCanvasStage.enableMouseOver(10);

	    // // // // // // // // // // // // // // // // // // // // // // // // 
	    // // // // // // // // // // // // // // // // // // // // // // // // 

	    var x1 = 290,
	        y1 = 40;
	    var x2 = 590,
	        y2 = 240;

	    // Determine the with and height
	    var lWidth = x2 - x1;
	    var lHeight = y2 - y1;

	    var lItem = null;

	    // video location
	    var lVideoLoc = "https://media.w3.org/2010/05/sintel/trailer.mp4";

        // Now lets create and play the video using HTML 5 Video ELement and
        // create DOM Elemment from our html element.
        lItem = createDOMElementVideo(lWidth, lHeight, lVideoLoc);

	    // Position the bitmap
	    lItem.x = x1;
	    lItem.y = y1;
	   

	    // // // // // // // // // // // // // // // // // // // // // // // // 
	    // // // // // // // // // // // // // // // // // // // // // // // // 

	    // add Bitmap to the stage
	    gBaseCanvasStage.addChild(lItem);

	    gBaseCanvasStage.update();

	}; // end_function init


	function createDOMElementVideo (lWidth, lHeight, lVideoPath) {

		// Lets find the parent HTML Element (we will add our media element to the end of this element as a child element)
		var idRef = '#container';
		// Lets make sure there is something here
		var lParent  = $(idRef)[0]; 
		
		if (!lParent) {
			var lMesg = "SWElementVideo.prototype.createDOMElementVideo:: Attempting to add a new video element to the DOM, however, unable to find specified DOM parent element ["+ idRef +"] ";
			return null;
		}

		// lets dynamically add a video element
		var lVideo = document.createElement('video');
		lVideo.src = lVideoPath;
		
		lVideo.hidden   = false;

 		lVideo.width  = lWidth;
 		lVideo.height = lHeight;
		
		// Lets set the volume
		lVideo.volume = 0.6;
		lVideo.controls = true;
		
		// Add a listener for errors
		var self = this; // Store a reference to this
		lVideo.addEventListener("error", function(evt) {
			var lErrMesg = "Error::SWElementVideo:: Error loading video element, event.type [" + evt.type + "] Media Details: ["+ evt.target.src + "]";
			console.log(lErrMesg);
	    });


        lVideo.play();
		// OK Lets add our media element as a child element of the specified parent HTML element.
 		lParent.appendChild(lVideo);

		// Convert this to a dom element so that it can be added to our container (display list).
		var lVideoDOMElement = new createjs.DOMElement(lVideo);
		
		return lVideoDOMElement;
		
	}; // end_function createDOMElementVideo
