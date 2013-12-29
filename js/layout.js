
$(document).ready(function () {
		//Layout
	/*	var mainLayout = $('body').layout({ 
			applyDefaultStyles: true,
			north__closable:false,
			north__resizable:false,
			east__size:300,
			east__closable:true,
			east__resizable:true,
			south__size:45,
			south__closable:false,
			south__resizable:false
		});*/
	
		var mainLayout = $('body').layout({ 
			applyDefaultStyles: true,
			north__closable:true,
			north__resizable:true,
			east__size:350,
			east__closable:true,
			east__resizable:true,
			east__onresize: function () { $("#accordion").accordion("resize"); },
			south__size:45,
			south__closable:false,
			south__resizable:false
		});
	
		// qTip plugin
		$('button[title], a[title]').qtip({ 
			style: { 
				name: 'dark', 
				tip: true,
				border:{width:2,color:'#AA810B',radius:3},
				width:{min:115}
			}
		});
		
	}); //doc.ready

			$(function(){  
				// Accordion  
				$("#accordion").accordion({ 
					header: "h3",
					clearStyle: true,
					fillSpace: true,
					autoheight: false,
					collapsible: true 
					 }
			);
					
 			  // Info Button
 			  // jk - functions moved to gmap_tkc.js
/**				$('#btn_info').click(function(e){	
					//alert("Clicked");			  
					  if (myMapClickListener) {
					  	alert("Info tool off.");
					  	GEvent.removeListener(myMapClickListener);
					  	myMapClickListener = null;
					  } else {
						  alert("Click on Map to view WMS attributes. Click Info tool again to turn off.");
							myMapClickListener = GEvent.addListener( map, "click", function(overlay, point){
						  getWMSinfo(point);  
					  });
						}
 				});  
**/

				//** Dialog	Intro	  
				$('#dialog_intro').dialog({  
					autoOpen: true,
					show: 'blind',
					modal: true,  
					width: document.body.clientWidth * .8,
					height: document.body.clientHeight * .8,
					buttons: {
						Agree: function() {
							$( this ).dialog( "close" );
						},
						Disagree: function(ev, ui) { window.open("http://www.kuskokwim.com","_parent") }						
					}
				});  
				
				//** Dialog	Query Results 
					$('#query-results').dialog({
						autoOpen: false,
						title: 'Query Results:',
						buttons: { "Ok": function() {
							 $(this).dialog("close"); } },
						//closeOnEscape: false,
						dialogClass: 'scrollable',
						height: 375,
						width: 350
						//height: $(window).height() / 1.5,
						//width: $(window).width() / 1.5,
						//modal: false
					});


				//** Search Location Dialog		
					$('#searchlocation-dialog').dialog({
						autoOpen: false,
						title: 'Search for Location',
						buttons: {
							 "Search": function() {
							 	fSearch();
								  $(this).dialog("close");
							  }, 
							 "Close": function() {
							 $(this).dialog("close"); } 
						},
						closeOnEscape: true,
						dialogClass: 'scrollable',
						height: 300,
						width: 450
						//modal: false
					});

				//** KML Dialog		
					$('#kml-dialog').dialog({
						autoOpen: false,
						title: 'Enter KML/KMZ info',
						buttons: {
							 "Load KML": function() {
							 	fKMLLoad();
								  $(this).dialog("close");
							  }, 
							 "Close": function() {
							 $(this).dialog("close"); } 
						},
						closeOnEscape: true,
						dialogClass: 'scrollable',
						height: 300,
						width: 450
						//modal: false
					});
										
				//** Location Search Tabs  
				$('#locationtabs').tabs();
			  
				//** Tabs  
				$('#tabs').tabs();  

});  // end function


$(function(){
	//Toolbar Mouse Functions
	$(".fg-button:not(.ui-state-disabled)")
	.hover(
		function(){ 
			$(this).addClass("ui-state-hover"); 
		},
		function(){ 
			$(this).removeClass("ui-state-hover"); 
		}
	)
	.mousedown(function(){
			$(this).parents('.fg-buttonset-single:first').find(".fg-button.ui-state-active").removeClass("ui-state-active");
			if( $(this).is('.ui-state-active.fg-button-toggleable, .fg-buttonset-multi .ui-state-active') ){ $(this).removeClass("ui-state-active"); }
			else { $(this).addClass("ui-state-active"); }	
	})
	.mouseup(function(){
		if(! $(this).is('.fg-button-toggleable, .fg-buttonset-single .fg-button,  .fg-buttonset-multi .fg-button') ){
			$(this).removeClass("ui-state-active");
		}
	});
});
