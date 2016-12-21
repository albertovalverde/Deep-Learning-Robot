(function($) { "use strict";


	//Page transitions

		$(function(){"use strict";
				var ascensor = $('#ascensorBuilding').ascensor({
					keyNavigation: true, 
					loop: true,
					time: 800,
					easing: "easeInOutQuint", 
					direction: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]], 
					ascensorFloorName:["home", "about-content" , "Robot","services-content", "work-content", "blog-content", "contact-content"]
				});
				var floorAdded = false;
				
				$(".cs-select li").click(function(event, index) {
					ascensor.trigger("scrollToStage", $(this).index());
				});
				
				$(".cs-select li:eq("+ ascensor.data("current-floor") +")").addClass("selected");

				ascensor.on("scrollStart", function(event, floor){
					$(".cs-select li").removeClass("selected");
					$(".cs-select li:eq("+floor.to+")").addClass("selected");
				});	
				
				$(".up").click(function() {
					ascensor.trigger("scrollToDirection" ,"up");
				});
					
				$(".down").click(function() {
					ascensor.trigger("scrollToDirection" ,"down");
				});
					
				$(".left").click(function() {
					ascensor.trigger("scrollToDirection" ,"left");
				});
					
				$(".right").click(function() {
					ascensor.trigger("scrollToDirection" ,"right");
				});	
		});
		

		
	//Sections fit screen	
		
		
		/*global $:false */
		$(function(){"use strict";
			$('.fulscreen-section').css({'height':($(window).height())+'px'});
			$(window).resize(function(){
			$('.fulscreen-section').css({'height':($(window).height())+'px'});
			});
		});




	
	//Menu select

			(function() {
				[].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {	
					new SelectFx(el);
				} );
			})();

			
	//Tooltip

	$(document).ready(function() {
		$(".tipped").tipper();
	});			
			
			
	//Steps Carousel

	$(document).ready(function() {
	 
	  var sync1 = $("#sync1");
	  var sync2 = $("#sync2");
	 
	  sync1.owlCarousel({
		singleItem : true,
		transitionStyle : "backSlide",
		slideSpeed : 1500,
		navigation: false,
		pagination:false,
		afterAction : syncPosition,
		responsiveRefreshRate : 200
	  });

	  
	  sync2.owlCarousel({
		items : 4,
		itemsDesktop      : [1199,4],
		itemsDesktopSmall     : [979,3],
		itemsTablet       : [768,2],
		itemsMobile       : [479,2],
		pagination:false,
		responsiveRefreshRate : 100,
		afterInit : function(el){
		  el.find(".owl-item").eq(0).addClass("synced");
		}
	  });
	 
	  function syncPosition(el){
		var current = this.currentItem;
		$("#sync2")
		  .find(".owl-item")
		  .removeClass("synced")
		  .eq(current)
		  .addClass("synced")
		if($("#sync2").data("owlCarousel") !== undefined){
		  center(current)
		}
	  }
	 
	  $("#sync2").on("click", ".owl-item", function(e){
		e.preventDefault();
		var number = $(this).data("owlItem");
		sync1.trigger("owl.goTo",number);
	  });
	 
	  function center(number){
		var sync2visible = sync2.data("owlCarousel").owl.visibleItems;
		var num = number;
		var found = false;
		for(var i in sync2visible){
		  if(num === sync2visible[i]){
			var found = true;
		  }
		}
	 
		if(found===false){
		  if(num>sync2visible[sync2visible.length-1]){
			sync2.trigger("owl.goTo", num - sync2visible.length+2)
		  }else{
			if(num - 1 === -1){
			  num = 0;
			}
			sync2.trigger("owl.goTo", num);
		  }
		} else if(num === sync2visible[sync2visible.length-1]){
		  sync2.trigger("owl.goTo", sync2visible[1])
		} else if(num === sync2visible[0]){
		  sync2.trigger("owl.goTo", num-1)
		}
		
	  }
	 
	});	 				
	

	//About 3D slider

	var pageflip = new RocketPageFlip('.pageflip', { 
		current: 0,
		directionalNav: false
	});		

	
	//Colorbox single services pop-up

	$(document).ready(function(){
	$(".iframe").colorbox({iframe:true, width:"100%", height:"100%"});	
	});

	$(".group1").colorbox({rel:'group1', transition:"fade"});
	$(".group2").colorbox({rel:'group2', transition:"fade"});
	$(".group3").colorbox({rel:'group3', transition:"fade", maxWidth:'95%', maxHeight:'95%'});
	$(".youtube").colorbox({iframe:true, innerWidth:940, innerHeight:450});
	$(".vimeo").colorbox({iframe:true, innerWidth:940, innerHeight:450});			


	
	//Services Carousel

	$(document).ready(function() {
	 
	  var sync1 = $("#sync3");
	  var sync2 = $("#sync4");
	 
	  sync1.owlCarousel({
		singleItem : true,
		transitionStyle : "backSlide",
		autoPlay:5000,
		stopOnHover : true,
		slideSpeed : 1500,
		navigation: false,
		pagination:false,
		autoHeight : true,
		afterAction : syncPosition,
		responsiveRefreshRate : 200
	  });

	  
	  sync2.owlCarousel({
		items : 4,
		itemsDesktop      : [1199,4],
		itemsDesktopSmall     : [979,4],
		itemsTablet       : [768,4],
		itemsMobile       : [479,4],
		pagination:false,
		responsiveRefreshRate : 100,
		afterInit : function(el){
		  el.find(".owl-item").eq(0).addClass("synced");
		}
	  });
	 
	  function syncPosition(el){
		var current = this.currentItem;
		$("#sync4")
		  .find(".owl-item")
		  .removeClass("synced")
		  .eq(current)
		  .addClass("synced")
		if($("#sync4").data("owlCarousel") !== undefined){
		  center(current)
		}
	  }
	 
	  $("#sync4").on("click", ".owl-item", function(e){
		e.preventDefault();
		var number = $(this).data("owlItem");
		sync1.trigger("owl.goTo",number);
	  });
	 
	  function center(number){
		var sync2visible = sync2.data("owlCarousel").owl.visibleItems;
		var num = number;
		var found = false;
		for(var i in sync2visible){
		  if(num === sync2visible[i]){
			var found = true;
		  }
		}
	 
		if(found===false){
		  if(num>sync2visible[sync2visible.length-1]){
			sync2.trigger("owl.goTo", num - sync2visible.length+2)
		  }else{
			if(num - 1 === -1){
			  num = 0;
			}
			sync2.trigger("owl.goTo", num);
		  }
		} else if(num === sync2visible[sync2visible.length-1]){
		  sync2.trigger("owl.goTo", sync2visible[1])
		} else if(num === sync2visible[0]){
		  sync2.trigger("owl.goTo", num-1)
		}
		
	  }
	 
	});				


	
	//Portfolio
	
	var $container = $('#projects-grid');
	// initialize Masonry after all images have loaded  
	$container.imagesLoaded( function() {
		$container.masonry({
			itemSelector: '.project-box'
		});
	});			
		
		
	//Testimonials slider
	
	$(document).ready(function(){
		$('.slider-testimonials').bxSlider({
			adaptiveHeight: true,
			touchEnabled: true,
			pager: false,
			controls: true,
			auto: false,
			slideMargin: 1
		});
	});	
	
	
	
	//Google map

	jQuery(document).ready(function(){
		var e=new google.maps.LatLng(44.789511,20.43633),
			o={zoom:14,center:new google.maps.LatLng(44.789511,20.43633),
			mapTypeId:google.maps.MapTypeId.ROADMAP,
			mapTypeControl:!1,
			scrollwheel:!1,
			draggable:!0,
			navigationControl:!1
		},
			n=new google.maps.Map(document.getElementById("google_map"),o);
			google.maps.event.addDomListener(window,"resize",function(){var e=n.getCenter();
			google.maps.event.trigger(n,"resize"),n.setCenter(e)});
			
			var g='<div class="map-tooltip"><h6>Ophion</h6><p>Check out our office</p></div>',a=new google.maps.InfoWindow({content:g})
			,t=new google.maps.MarkerImage("images/map-pin.png",new google.maps.Size(40,70),
			new google.maps.Point(0,0),new google.maps.Point(20,55)),
			i=new google.maps.LatLng(44.789511,20.43633),
			p=new google.maps.Marker({position:i,map:n,icon:t,zIndex:3});
			google.maps.event.addListener(p,"click",function(){a.open(n,p)}),
			$(".button-map").click(function(){$("#google_map").slideToggle(300,function(){google.maps.event.trigger(n,"resize"),n.setCenter(e)}),
			$(this).toggleClass("close-map show-map")});

	});	



			
			
})(jQuery);







	