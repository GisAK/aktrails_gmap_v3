/** Code Developed by   
		John Koltun, Geographic Resource Solutions, Anchorage Alaska  
		koltunj<at>grsalaska.com  
		www.grsgis.com  
		WMS connector based on wms mashup code by John Deck, UC Berkeley  
		See jscript include files for appropriate credits
		Copyright 2013, Geographic Resource Solutions, Anchorage Alaska
		Google Maps API v3
*/  

// TO DO
// 
  // listener for feature info
  var myMapClickListener;
  var myMapKMLListener;
  // listener for weather
  var myMapClickListenerWx;
  // map 
  var map;
  // store initial bounds for use in "full extent" button
  var bounds;
  var fullMapLatLng =  new google.maps.LatLng(61.00, -150.00);
  var fullMapZoom = 7;
  
	var C_AKImage_Map;
	var C_AKDRG_Map;
	
	//v3 Measure tool
	// Load the Visualization API and the columnchart package.
	google.load('visualization', '1', {packages: ['columnchart']});
  
  //*************************************************************//
    function initialize() { 
    	  //window.alert("initialize"); 
    	  var mapOpts = {
						center: fullMapLatLng,
						mapTypeId: google.maps.MapTypeId.TERRAIN,
						zoom: fullMapZoom,
    				mapTypeControl: true,
    				mapTypeControlOptions: {
					      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
							  mapTypeIds: [google.maps.MapTypeId.ROADMAP,'OSM','BDL','DRG',google.maps.MapTypeId.HYBRID,google.maps.MapTypeId.TERRAIN]
						}
				};
				
			   var bdlMapType = new google.maps.ImageMapType({
	          name: 'AK SDMI Satellite',
	          alt:  'Best Data Layer',
	          minZoom: 1,
	          maxZoom: 21,
	          tileSize: new google.maps.Size(256, 256),
	          isPng: true,
	          getTileUrl: function(a, z) {
	            var tiles = 1 << z, X = (a.x % tiles);
	            if(X < 0) { X += tiles; }
	            var baseUrl = 'http://swmha.gina.alaska.edu/tilesrv/bdl/tile/';
	            return baseUrl + X + '/' + a.y + '/' + z + '.png';
	          }
	        });

			   var drgMapType = new google.maps.ImageMapType({
	          name: 'USGS Topo Maps',
	          alt:  'USGS Topo Maps',
	          minZoom: 1,
	          maxZoom: 21,
	          tileSize: new google.maps.Size(256, 256),
	          isPng: true,
	          getTileUrl: function(a, z) {
	            var tiles = 1 << z, X = (a.x % tiles);
	            if(X < 0) { X += tiles; }
	            var baseUrl = 'http://tiles.gina.alaska.edu/tilesrv/drg/tile/';
	            return baseUrl + X + '/' + a.y + '/' + z;
	          }
	        });

					//Define OSM as base layer in addition to the default Google layers
					var osmMapType = new google.maps.ImageMapType({
					                getTileUrl: function (coord, zoom) {
					                    return "http://tile.openstreetmap.org/" +
					          zoom + "/" + coord.x + "/" + coord.y + ".png";
					                },
					                tileSize: new google.maps.Size(256, 256),
					                isPng: true,
					                alt: "OpenStreetMap",
					                name: "OSM",
					                maxZoom: 19
					            });
             
      	var mapDiv = document.getElementById('map_canvas'); 
      	     
        map = new google.maps.Map(mapDiv, mapOpts);  
             
	  			//**** Listener for MouseMove Event for Lat Long Box ****//
	  			 //var lastPoint; 
					 google.maps.event.addListener(map, "mousemove", function(eventPnt){  
					   var latLngStr = eventPnt.latLng;  
					 	 $("#LatLonBox").html("xy:" + latLngStr.toUrlValue(6) );  
					 }); 
					 
	   
				  //*** Create Custom WMS Maps for Backdrop ****//
				  ////////////////////////////////////////////////       
				  //** Alaska Mapped DRG ***  
			    //Add the new 'DRG' to the map registry
            map.mapTypes.set('DRG', drgMapType);            
            //Set the map to use the BDL map type as default 
            //map.setMapTypeId('DRG');
 				 
 				 	//**** Alaska Mapped Best Data Layer Imagery v3 (from GINA example **** // 
            //Add the new 'BDL' to the map registry
            map.mapTypes.set('BDL', bdlMapType);          
            //Set the map to use the BDL map type as default 
            //map.setMapTypeId('BDL');
            
 				 	//**** Open Street Map **** // 
            //Add the new 'OSM' to the map registry
            map.mapTypes.set('OSM', osmMapType);          
            //Set the map to use the OSM map type as default 
            //map.setMapTypeId('OSM');
            // test of using OSM as overlay - cannot set opacity so doesn't work
    				//map.overlayMapTypes.push(osmMapType);  

				  ///////////////////////////////   
				  //*** Add Zoom Box Control **//  
         map.enableKeyDragZoom({
			          visualEnabled: true,
			          visualPosition: google.maps.ControlPosition.LEFT,
			          visualPositionOffset: new google.maps.Size(35, 0),
			          visualPositionIndex: null,
			          visualSprite: "http://maps.gstatic.com/mapfiles/ftr/controls/dragzoom_btn.png",
			          visualSize: new google.maps.Size(20, 20),
			          visualTips: {
			            off: "Turn on",
			            on: "Turn off"
			          },        	
                boxStyle: {
                  border: "thick dashed black",
                  opacity: 0.5
                },
                paneStyle: {
                  backgroundColor: "gray",
                  opacity: 0.2
                }
          });
                    
					//******************************************//  
					//**** Add Layers to Layer List and Map*****//
					//**** New consoldated layers versions
					//**** New logic for single addLayerTR and visibility ***//			    
					  for(var wmslayer in wmslayers) {
					  	 // now adds both wms and kml 
					  	addLayerTR(wmslayer);
		  	 
							//c201312 logic to set initial visibility 
		    		  if (wmslayers[wmslayer].visible == true) 
		    		  {
									switch (wmslayers[wmslayer].layertype)
									{
										case "wms":
											toggleWMS(wmslayer, true);
										break;
										case "kml":
											toggleGeoXML(wmslayer, true);
										break;
										case "googlelayer":
											toggleGoogleLayer(wmslayer, true);
										break;
										case "fusion":
											toggleFusionLayer(wmslayer, true);
										break;
									}
									
								document.getElementById(wmslayer).checked = true;					    	
					    	}//if
					    												    			
					  }  // for

			    //--------------------------------//
			    //---- Initialization functions --//					  
				  	loadLegend();
				    loadBookmarks();
					         
  } //function  initalize

 
  
  //-------------------------------------------------//
 //--------- WMS & KML Info Request -----------------//
 //** called by map click event
 function getWMSKMLinfo(point) {
	//*** Identify Functionality for WMS Layers
	//*** point = GLatLng
	
	  // Initialize variable to determine if any layer is toggled for selection
		var bLayerFound = new Boolean();
		bLayerFound = false;
		
		for(var wmslayer in wmslayers) {
			if (document.getElementById(wmslayer).checked == true &&
			document.getElementById(wmslayer + "_rdo").checked == true )
			{
				bLayerFound = true;
				
				if (wmslayers[wmslayer].layertype == "wms")
				{
					//--------------------------------------------------------//
					//-- Calculate WMS get feature info location parameters --//
					var tileCoordinate = new google.maps.Point();
					var tilePoint = new google.maps.Point();
					var currentProjection = G_NORMAL_MAP.getProjection();
					var tileNWCornerpx = new google.maps.Point();
					var tileNWCorner = new google.maps.Point();
					var tileSECornerpx = new google.maps.Point();
					var tileSECorner = new google.maps.Point();
					var tileOffsetpx = new google.maps.Point();
		
					//*Debug*/window.alert("wms layer: "+ wmslayers[wmslayer].layername);
		
					//* Get global pixel location of point based on Google function
					tilePoint = currentProjection.fromLatLngToPixel(point, map.getZoom());
					//* Get tile boundary pixel coordinates - round down based on 256px tiles
					tileCoordinate.x = Math.floor(tilePoint.x / 256);
					tileCoordinate.y = Math.floor(tilePoint.y / 256);
		
					//** Use edge of tile to calculate NW corner pixel coordinates of tile that contains point
					tileNWCornerpx.x = tileCoordinate.x * 256;
					tileNWCornerpx.y = tileCoordinate.y * 256;
					//** Convert NW corner pixel coordinates back to Lat Long
					tileNWCorner = currentProjection.fromPixelToLatLng(tileNWCornerpx, map.getZoom());
		
					//** Use edge of tile to calculate SE corner pixel coordinates of tile that contains point
					tileSECornerpx.x = (tileCoordinate.x + 1) * 256;
					tileSECornerpx.y = (tileCoordinate.y + 1) * 256;
					//** Convert SE corner pixel coordinates back to Lat Long
					tileSECorner = currentProjection.fromPixelToLatLng(tileSECornerpx, map.getZoom());
		
					//** Calculate offset - in pixels - from edge to point identified
					tileOffsetpx.x = tilePoint.x - tileNWCornerpx.x
					tileOffsetpx.y = tilePoint.y - tileNWCornerpx.y
		
	
					//** Static values of WMS URL 
					var gfiserviceUrl = "SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo";
					var gfiXYoffset = "&X=" + tileOffsetpx.x + "&Y=" + tileOffsetpx.y;
					//* WMS only cares about the offset from the edge of a define window. Here we define it as a 256px tile
					var gfiWidthHeight = "&WIDTH=256&HEIGHT=256";
					var gfiEPSG = "&SRS=EPSG:" + 4326;
					var gfiBBox = "&BBOX=" + tileNWCorner.x + ","+ tileSECorner.y + "," + tileSECorner.x + "," + tileNWCorner.y;
					//** For tabbed info box
					//var infoTabs = [];
					//var tabContent;
		
					//*Debug*/alert("Building Url for layer: " + wmslayers[wmslayer].layername);
					
					//** Build WMS location portion of URL
					//** wms base url **
					var gfiWMSbaseUrl = wmslayers[wmslayer].url;
					//** layer name **
					var gfiQueryLayer = "&QUERY_LAYERS=" + wmslayers[wmslayer].layername;
					var gfiLayerName = "&LAYERS=" + wmslayers[wmslayer].layername;
					var gfiOptions = "&INFO_FORMAT=" + wmslayers[wmslayer].infoformat + "&STYLES=&FORMAT=" + wmslayers[wmslayer].format;
		
		
					var gfiURL = gfiWMSbaseUrl+gfiserviceUrl+gfiQueryLayer+gfiLayerName+gfiXYoffset+gfiWidthHeight+gfiEPSG+gfiBBox+gfiOptions;
		
					// Create an iframe window for each wms layer processed
					var content = "<div height='300px' width='300px'>Query Results:<br/>" + wmslayers[wmslayer].legendname + "<br/><iframe height='80%' width='100%' src=" + gfiURL + ">Iframe Not Supported</iframe></div>";
		
					// Multi-Tab Option: Load Tabs
					//tabContent = "<iframe height='100%' width='100%' src=" + gfiURL + ">Iframe Not Supported</iframe>";
					//infoTabs.push(new GInfoWindowTab(wmslayers[wmslayer].legendname, tabContent));
		
					// Dialog to replace Info Window
					//$("#query-results").html(content);
					//$('#query-results').dialog('open');
		
				map.openInfoWindowHtml(point, content);

				} // if wms type
				else { //** KML Layer is selected
					//** put code here for handling kml layers passed through click event
					//** currently, kml layers are handled by hidden event in gm (not controlled)
					window.alert("KML Layers can be queried by simply left-clicking on the feature");
					//map.enableInfoWindow();
					//google.maps.event.trigger(point,"click");
					//google.maps.event.trigger(map,"click",null,tilePoint,tilePoint);
					//map.openInfoWindow(point);
				}
			}  // if layer visible and selectable
		}  // for each layer

    if (!bLayerFound ) {
    	window.alert("Sorry, you haven't selected a layer to query. You must toggle a layer's selection button to query features.");
    }

		// ** Tabbed InfoWindow Version
		//map.openInfoWindowTabsHtml(point, infoTabs);
		
		//** Single InfoWindow Version
		//map.openInfoWindowHtml(point, content);
		
		
}// end function getWMSinfo

  //-------------------------------------------------//
  //--------- Load Legends into Legends Tab ---------//
  //** called by map initialize and toggle layers
	function loadLegend() {
		//clear exsiting legend
		var tbody = document.getElementById("legendgraphicTBODY")
 		while (tbody.hasChildNodes && tbody.lastChild){tbody.removeChild(tbody.lastChild);}

		for (var slayer in wmslayers) { 
			//window.alert("Name: " + wmslayers[slayer].layername);
			if (document.getElementById(slayer).checked == true) {
				  var layerTR = document.createElement("tr");  
				  var nameTD = document.createElement("td");
				  var iconTD = document.createElement("td");
  				//iconTD.style.width = "20px";
  				
  				// Create Layer Name Row
				  var name = document.createTextNode(wmslayers[slayer].legendname);  
				  nameTD.appendChild(name);
					layerTR.appendChild(nameTD);
					
					// Create Legend Image Row
					var legendTR = document.createElement("tr");
					if (wmslayers[slayer].layertype == "wms")
						{
							// Create Legend Icon for wms layers
							var WMSservice = "SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic";
		          var WMSOptions = "&STYLES=&WIDTH=200&HEIGHT=16&FORMAT=image/gif";
		          //var WMSOptions = "&STYLES=&FORMAT=image/png";
					    var WMSbaseUrl = wmslayers[slayer].url;
					    var WMSLayerName = "&LAYER=" + wmslayers[slayer].layername;
					          
					    var WMSURL = WMSbaseUrl+WMSservice+WMSLayerName+WMSOptions;
		 					//*Debug*/window.alert("URL: " + WMSURL);
											  
						  var deImg = document.createElement("img");
						  deImg.src = WMSURL;
		  
						  iconTD.appendChild(deImg);
						 }
						 else
						 {
						 	var dummytext = document.createTextNode("--");
						 	iconTD.appendChild(dummytext);
							}
				    
				  legendTR.appendChild(iconTD);

			
				  //*** Put legend entry into tab
				  document.getElementById("legendgraphicTBODY").appendChild(layerTR);
				  document.getElementById("legendgraphicTBODY").appendChild(legendTR);
			}
		}
  }  //function loadLegend


  //-------------------------------------------------//
	// Add layer entry in Layer List and set function
	// New logic replaces separate functions for KML and WMS  
	function addLayerTR(id) {
		// Create Layer Text Element  
	  var nameTD = document.createElement("td");
	  var nameA = document.createElement("a");
	  nameA.href = wmslayers[id].linkurl;
	  nameA.target = "_blank";
	  var name = document.createTextNode(wmslayers[id].legendname);
	  nameA.appendChild(name);
	  nameTD.appendChild(nameA);
	  
	  // Create Elements for Checkbox 
	  // - this is split by logic for wms/kml differences
	  // - don't mess with the ordering of all this
	  var inputTD = document.createElement("td");  
	  var input = document.createElement("input");
	  input.type = "checkbox";  
	  input.id = id;
	  
	  //**v3 Changed to switch-case statements
	  switch (wmslayers[id].layertype) {
	  	case "wms":
			  	input.onclick = function () { toggleWMS(this.id, this.checked); loadLegend() };
			  	
			  	// Since this is WMS - Create FeatureInfo Radio Button
				  var radioTD = document.createElement("td");  
				  var inputradio = document.createElement("input");
				  inputradio.type = "radio";  
				  inputradio.id = id + "_rdo";  
				  inputradio.name = "rdo_identify";
				  // If the layer is identfied in maplayers as non-query type of layer then disable the query toggle
				  if (wmslayers[id].infoformat == "none"){ 
				  	inputradio.disabled = true;
				  	};
				  radioTD.appendChild(inputradio);	  	
	  	break;
	  	case "kml":
		  	input.onclick = function () { toggleGeoXML(this.id, this.checked); loadLegend() };
			  /* No Radio-Toggle Version: */
			  var radioTD = document.createElement("td");	  	
	  	break;
	  	case "googlelayer":
		  	input.onclick = function () { toggleGoogleLayer(this.id, this.checked); /*loadLegend()*/ };
			  /* No Radio-Toggle Version: */
			  var radioTD = document.createElement("td");	  		  	
	  	break;
	  	case "fusion":
		  	input.onclick = function () { toggleFusionLayer(this.id, this.checked); /*loadLegend()*/ };
			  /* No Radio-Toggle Version: */
			  var radioTD = document.createElement("td");	  		  	
	  	break;
		}
 	  
	  inputTD.appendChild(input);

	  // Create the Table Row Element and add columns in order
	  var layerTR = document.createElement("tr");   
	  layerTR.appendChild(inputTD);
	  layerTR.appendChild(radioTD);
	  layerTR.appendChild(nameTD);
	  
	  //*** Logic to put legend entry into specific jquery accordian location
 	  switch (wmslayers[id].category)
	  {
	  	case "trails":
	  		document.getElementById("legend1TBODY").appendChild(layerTR);
	  	break;
	  	case "avalanche":
	  		document.getElementById("legend2TBODY").appendChild(layerTR);
	  	break;
	  	case "weather":
	  		document.getElementById("legend3TBODY").appendChild(layerTR);
	  	break;
	  	case "background":
	  		document.getElementById("legend4TBODY").appendChild(layerTR);
	  	break;
	  	
	  } 
  }  //function

  //------------------------------------//
  //--------- Toggle KML Layer ---------//  
	function toggleGeoXML(id, checked) {  
	  if (checked) {     
	    var geoXml = new google.maps.KmlLayer(wmslayers[id].url, {preserveViewport: true}); 
	    wmslayers[id].geoXml = geoXml; 
	    geoXml.setMap(map);
		
	  } else if (wmslayers[id].geoXml) {  
	    //2 map.removeOverlay(wmslayers[id].geoXml);
	    var geoXml = wmslayers[id].geoXml;  
	    geoXml.setMap(null);
	  }  
	}//function 

	  //--------------------------------------//
	  //--------- Toggle Google Layer ---------//  
	//**v3 Added support for google layers **//
	function toggleGoogleLayer(id, checked) {  
	  	switch (wmslayers[id].layername){
	  		case "gbicycle":
	  			if (checked) {
							var bikeLayer = new google.maps.BicyclingLayer();
							wmslayers[id].googleLayer = bikeLayer;
						  bikeLayer.setMap(map);
				  } else if (wmslayers[id].googleLayer) {  
				    var glayer = wmslayers[id].googleLayer;  
				    glayer.setMap(null);
				  }  						  
				break;
	  		case "gweather":
	  			if (checked) {
						  var weatherLayer = new google.maps.weather.WeatherLayer({
						    temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT
						  });
							wmslayers[id].googleLayer = weatherLayer;
						  weatherLayer.setMap(map);
				  } else if (wmslayers[id].googleLayer) {  
				    var glayer = wmslayers[id].googleLayer;  
				    glayer.setMap(null);
				  }  						  
				break;
	  	}//switch       
	}//function 

  //------------------------------------//
  //--------- Toggle WMS Layer ---------//  	 
	function toggleWMS(id, checked) {  
	  if (checked) {  
    	var wmsOptions = {                          
        alt: wmslayers[id].layername,                                        
        isPng: false,                           
        maxZoom: 20,                            
        minZoom: 0,                             
        name: wmslayers[id].layername,                            
        opacity: 0.5,                           
        tileSize: new google.maps.Size(256, 256),
        getTileUrl: function(tile,zoom) {
				    var projection = window.map.getProjection();
				    var zpow = Math.pow(2,zoom);
				    var ul = new google.maps.Point(tile.x*256.0/zpow, (tile.y+1)*256.0/zpow);
				    var lr = new google.maps.Point((tile.x+1)*256.0/zpow, (tile.y)*256.0/zpow);
				    var ulw = projection.fromPointToLatLng(ul);
				    var lrw = projection.fromPointToLatLng(lr);
				    var baseURL = wmslayers[id].url; //begining of the WMS URL ending with a "?" or a "&".
				    var format = wmslayers[id].format; //type of image returned
				    var layers = wmslayers[id].layername; //WMS layers to display, comma separated (?)
				    var styles = ""; //styles to use for the layers
				    var srs = "EPSG:4326"; //projection to display. This is the projection of google map. Don't change unless you know what you are doing.
				    var bbox = ulw.lng() + "," + ulw.lat() + "," + lrw.lng() + "," + lrw.lat();
				    var url = baseURL + "version=1.1.1&request=GetMap&Layers=" + layers + "&Styles=" + styles + "&SRS="+ srs +"&BBOX=" + bbox + "&width=" + this.tileSize.width +"&height=" + this.tileSize.height + "&format=" + format + "&transparent=true";
				    //console.log(url);
						return url;         	
      	}      	
    	};
    	                                          
      var wmsMapType = new google.maps.ImageMapType(wmsOptions);
    
    	//map.overlayMapTypes.insertAt(0, wmsMapType); 
    	map.overlayMapTypes.push(wmsMapType);  
 		  
 		  //** Save overlay layer object so we can remove it later **//
 		  var myOverTileLayer = wmsMapType;
 		  wmslayers[id].OverlayLayer = myOverTileLayer;
 		  wmslayers[id].OverlayLayerNumber = map.overlayMapTypes.getLength()- 1 ;
 		  
	  } else if (wmslayers[id].OverlayLayer) {  
	  		//alert("remove overlay");
	  		map.overlayMapTypes.removeAt(wmslayers[id].OverlayLayerNumber);  
	  }
	}//function  

  //------------------------------------//
  //--------- Toggle Fusion Table Layer ---------//  	  	
	function toggleFusionLayer(id, checked) {  
	  if (checked) {     
	    var fusionlayer = new google.maps.KmlLayer(wmslayers[id].url, {preserveViewport: true}); 
	    
	    var fusionlayer = new google.maps.FusionTablesLayer({
        query: {
          select: wmslayers[id].fusioncolumn,
          from: wmslayers[id].url,
          where: wmslayers[id].fusionwhere
        },
        styleId: 2,
        templateId: 2
      });

	    wmslayers[id].fusionlayer = fusionlayer; 
	    fusionlayer.setMap(map);
		
	  } else if (wmslayers[id].fusionlayer) {  
	    //2 map.removeOverlay(wmslayers[id].geoXml);
	    var fusionlayer = wmslayers[id].fusionlayer;  
	    fusionlayer.setMap(null);
	  }  
	}//function 
 	
//-------------------------------------------------//
// Control Toolbar Buttons 
// All buttons now call this function  
function toggleButton(element) {
	 	  switch (element.name)
	  {
	  	case "zoomfull":
	  		map.setCenter(fullMapLatLng);
	  		map.setZoom(fullMapZoom);
	  	break;
	  	case "zoominfixed":
	  		map.setZoom(map.getZoom()+1);
	  	break;
	  	case "zoomoutfixed":
	  		map.setZoom(map.getZoom()-1);
	  	break;
	  	case "zoomindrag":
	  		//2 dragzoom.initiateZoom();
	  		$('img[src=http://maps.gstatic.com/mapfiles/ftr/controls/dragzoom_btn.png]').click();
	  	break;
	  	case "pan":
	  		// This is default mode for GM API
	  	break;
	  	case "measureline":
	  		// call fuction for setting the listenter and drawing path
	  		// in gmap_measure.js
	  		fMapMeasure();
	  	break;
	  	case "btnbookmarks":
					$('#searchlocation-dialog').dialog('open');
	  	break;
	  	case "btnKML":
					$('#kml-dialog').dialog('open');	  	
	  	break;	  	
	  	case "btnweather":
	  	//**v3 Added Weather Forecast Tool. Click on map to get point forecast which opens in new window
	  				if (myMapClickListenerWx) {
	  						//alert("Wx off.");
	  						// reset cursor to default
	  						map.setOptions({draggableCursor:''});
						  	google.maps.event.removeListener(myMapClickListenerWx);
						  	myMapClickListenerWx = null;
					  } else {
					  		//alert("Wx on.");
					  		// set cursor to custom for weather tool
					  		map.setOptions({draggableCursor:'cell'});
					  		myMapClickListenerWx = google.maps.event.addListener(map, "click", function(clicklocation){  
					   				var clickLat =  clicklocation.latLng.lat();
					   				var clickLng =  clicklocation.latLng.lng();
					   				var forecastLink = "http://forecast.weather.gov/MapClick.php?site=mtr&smap=1&textField1=" + clickLat + "&textField2=" + clickLng + "&TextType=2";
					   				window.open(forecastLink,"AKtrails: NOAA Weather","width=680,height=800");
					 			}); 
						}
	  	break;
	  	case "info":
						 if (myMapClickListener) {
						  	alert("Info tool off.");
						  	google.maps.event.removeListener(myMapClickListener);
						  	myMapClickListener = null;
						  	map.enableInfoWindow();
					  } else {
					  	/********************************************************?
					  	/* Regular Click Version - Conflicts With KML overlays */
						  //alert("Click on Map to view WMS attributes. Click Info tool again to turn off.");				  
							//map.disableInfoWindow();
							/* myMapClickListener = google.maps.event.addListener( map, "click", 
								function(overlay, point){
										if (overlay) 
										{
										  //window.alert("click on Overlay");
										}
											else
										{
											//window.alert("click on Map ");
									  	getWMSKMLinfo(point);
									  }; 
						  		});
						  	*/
					  	
						  	/********************************************************?
						  	/* Right-Click Version -  */
					  		/*Debug Testing for Right-Click Map Event Listener */
					  		
					  		window.alert("RIGHT-Click on Map to view WMS attributes. KML Layers can be queried by simply left-clicking on the feature. Click Info tool again to turn off.");
			 					//map.disableInfoWindow();
			 					myMapClickListener = google.maps.event.addListener(map, "singlerightclick", function(pixel,tile,overlay){
				 						//window.alert(" right click");
				 						clickedPixel = pixel;
				 						//var x = pixel.x;
				 						//var y = pixel.y;
				 						var LatLonPnt = map.fromContainerPixelToLatLng(clickedPixel)
				 						if (!overlay){ 
											//var latLngStr = LatLonPnt.lat().toFixed(6) + ', ' + LatLonPnt.lng().toFixed(6);  
											//window.alert("click on map " + latLngStr);
										  getWMSKMLinfo(LatLonPnt);
										}
										else {
											//window.alert("click on overlay");
										};
								});  //function
					  }; //if
	  	break;
	  	case "print":
	  		window.open('printmap.htm','_blank');
	  	break;
	  } 

} // End Function toggleButton

//-------------------------------------------------//
// Add spatial bookmarks from bookmarks json array 
// bookmarks dialog select box  
function loadBookmarks(){	
  var select_html = '<select id="selBookmark" onChange="zoomBookmark(this)">' +
                        '<option selected> - Select a location - <\/option>';

	for (var bm in gbookmarks ) {
	  select_html += '<option> ' + bm + '<\/option>';
	};
	select_html += '<\/select>';
		
	//document.getElementById("bookmarks-dialog").innerHTML = select_html;
	$("#loctabs-1").html(select_html);

}// End Function loadBookmarks

//-------------------------------------------------//
// Search for bookmark from bookmark dialog 
// this is called from layout.js  
// jmk: moved here to move hard-wired identifiers from laout.js
function fSearch() {
	 	var seltabidx = $( "#locationtabs" ).tabs( "option", "selected");
	 	//*Debug*/window.alert("seltabidx: " + seltabidx );
	 	switch (seltabidx)
		 	{ case 0: /*Location Tab*/
		 		  var selectValue = $("#selBookmark").val();
		 			fGoToBookmark (selectValue);
		 		break;
		 		case 1: /*LatLonTab*/
		 		  var vlatlon = $("#txtlatlon").val();
		      fGoToLatLong (vlatlon);
		 		break;
		 	} 
} //fSearch

function fKMLLoad(){
	// get values from dialog //
	var URLValue = $("#kmlUrl").val();
	var NameValue = $("#kmlName").val();
	var CategoryValue = $("#kmlCategory").val();
	// create id value based on user's name
	var IDValue = NameValue.trim() + "_ID";
	
	if (URLValue) {
		// set values for new entry in wmslayers
		if (typeof(wmslayers[IDValue]) === "undefined") {
				
			wmslayers[IDValue]= {
			"url":  URLValue,  
			"linkurl": URLValue,  
			"name": NameValue,
			"legendname": NameValue, 
			"category": CategoryValue,
			"layertype": "kml",
			"infoformat": "kml",
			"visible": "true", 
			"zoom": "8",
			"lat": 60.00,
			"lng": -151.0
			} ; 

			//Add to Layer/legend
			addLayerTR(IDValue);
		
			//Turn Layer On
			
			toggleGeoXML(IDValue, "true");
			document.getElementById(IDValue).checked = true;
		
		} else {
			alert("Name " + NameValue + " is not unique, please choose a different name");
		}
	}

}// fKMLLoad

//-------------------------------------------------//
// Handle spatial bookmarks on-change event from 
// bookmarks dialog select box  
function zoomBookmark (selectbox) {
	//*Debug*/window.alert("selectbox " + selectbox );
	var selidx = selectbox.selectedIndex;
	var selid = selectbox.options[selidx].text;
	//*Debug*/window.alert("index: " + selidx + " text: "+ selid);
	map.setCenter(new google.maps.LatLng( gbookmarks[selid].lat,gbookmarks[selid].lng));
	map.setZoom(gbookmarks[selid].zoom);
}

//-------------------------------------------------//
// Handle spatial bookmarks call from 
// Search button on dialog  
function fGoToBookmark(bookmarktext){
	//2 map.setCenter(new GLatLng( gbookmarks[bookmarktext].lat,gbookmarks[bookmarktext].lng), gbookmarks[bookmarktext].zoom);
	map.setCenter( new google.maps.LatLng(gbookmarks[bookmarktext].lat, gbookmarks[bookmarktext].lng));
	map.setZoom(gbookmarks[bookmarktext].zoom);
}// End function

function fGoToLatLong(slatlon){
	//*Debug*/window.alert("latlon: " + slatlon );
	var arrlatlon = slatlon.split(',');
	//*Debug*/window.alert("lat " + arrlatlon[0] + " Lon: " + arrlatlon[1] );
	map.setCenter(new google.maps.LatLng(arrlatlon[0], arrlatlon[1]));
}

//-------------------------------------------------//
// Handle Township call from 
// Search button on Find Location dialog  
// function fGoToTownship (township){
// 	try
// 	{
// 		//*Debug*/window.alert("trs " + township + " lat " + gTownshipArray[township].lat + " Lon: " + gTownshipArray[township].lon );
// 		map.setCenter(new google.maps.LatLng( gTownshipArray[township].lat,gTownshipArray[township].lon));
// 	}
// 	catch(err)
// 	{
// 		window.alert("Township Not Found: " + township);
// 	}
// }


//-------------------------------------------------//
// Handle Native Allottment call from 
// Search button on Find Location dialog  
// function fGoToAllotment (allotment){
// 	try
// 	{
// 		//*Debug*/window.alert("allot " + allotment + " lat " + gAllotmentArray[allotment].lat + " Lon: " + gAllotmentArray[allotment].lon );
// 		map.setCenter(new google.maps.LatLng( gAllotmentArray[allotment].lat,gAllotmentArray[allotment].lon));
// 	}
// 	catch(err)
// 	{
// 		window.alert("Allotment Not Found: " + allotment);
// 	}
// }

 

 
