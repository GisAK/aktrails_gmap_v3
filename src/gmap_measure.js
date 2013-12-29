// Measuring module for google maps v3
// John Koltun, 2013
// https://developers.google.com/maps/documentation/javascript/examples/elevation-paths
// expect global "map" variable

var MyMapPolyListener
var poly;
var path;
var chart;

				  // Create an ElevationService.
  				elevator = new google.maps.ElevationService();

function fMapMeasure(){
	  				if (MyMapPolyListener) {
	  						//alert("Measure off.");
	  						// reset cursor to default
	  						map.setOptions({draggableCursor:''});
						  	google.maps.event.removeListener(MyMapPolyListener);
						  	MyMapPolyListener = null;
						  	
								path = poly.getPath();
								
								var pathArray = [];
								for (var idx = 0; idx < path.getLength(); idx++){
									pathArray[idx] = path.getAt(idx);
								}
								
								$('#query-results').dialog('open');
								
								chart = new google.visualization.ColumnChart(document.getElementById('chart-results'));
								
								
							  // Create a PathElevationRequest object using this array.
							  // Ask for 256 samples along that path.
							  var pathRequest = {
							    'path': pathArray,
							    'samples': 256
							  }

							  // Initiate the path request.
							  elevator.getElevationAlongPath(pathRequest, function(results, status){
											  // Extract the elevation samples from the returned results
											  // and store them in an array of LatLngs.
											  var elevations = results;
											  var elevationMax = elevations[0].elevation;
											  var elevationMin = elevations[0].elevation;
												var elevationTot = 0;
											  var elevationPath = [];
											 
											  for (var i = 0; i < elevations.length; i++) {
											    elevationPath.push(elevations[i].location);
											  if (elevations[i].elevation < elevationMin) elevationMin = elevations[i].elevation;
											  if (elevations[i].elevation > elevationMax) elevationMax = elevations[i].elevation;
											  if (i > 0) elevationTot += Math.abs(elevations[i].elevation - elevations[i-1].elevation);
											  }
														  	
											  // Extract the data from which to populate the chart.
											  // Because the samples are equidistant, the 'Sample'
											  // column here does double duty as distance along the
											  // X axis.
											  var data = new google.visualization.DataTable();
											  data.addColumn('string', 'Sample');
											  data.addColumn('number', 'Elevation');
											  for (var i = 0; i < elevations.length; i++) {
											    data.addRow(['', elevations[i].elevation]);
											  }
											
											  // Draw the chart using the data within its DIV.
											  document.getElementById('chart-results').style.display = 'block';
											  chart.draw(data, {
											    height: 150,
											    legend: 'none',
											    titleY: 'Elevation (m)'
											  });//chart											 

											  var elevationChange = elevationMax - elevationMin;
											  var elevHtml = "<table><tbody><tr><td>Min Elevation: " + elevationMin.toFixed(1) +" </td></tr>";
											  elevHtml += "<tr><td>Max Elevation: " + elevationMax.toFixed(1) +" </td></tr>";
											  elevHtml += "<tr><td>Max Elevation Change: " + elevationChange.toFixed(1) +" </td></tr>";
											  elevHtml += "<tr><td>Cum. Elevation Change: " + elevationTot.toFixed(1) +" </td></tr>";
											  elevHtml += "</tbody></table>";
											  document.getElementById('elevation-results').innerHTML = elevHtml;
								});//elevation

								var pathDistance = google.maps.geometry.spherical.computeLength(path);
								var pathDistanceMi = pathDistance/1609.344;
								//var txtNode = document.createTextNode("Distance: " + pathDistance.toFixed(2) + " m");
							  var distHtml = "<table><tbody><tr><td>Distance(m): " + pathDistance.toFixed(1) + " </td></tr>";
							  distHtml += "<tr><td>Distance(mi): " + pathDistanceMi.toFixed(2) +" </td></tr>";
							  distHtml += "</tbody></table>";
							
								//document.getElementById('distance-results').innerHTML = "Distance: " + pathDistance.toFixed(2) + " m";
								document.getElementById('distance-results').innerHTML = distHtml;
					  	
						  	//** remove polyline
						  	//poly.setMap();
						  	
					  } else {
					  		alert("Click on map to draw path to measure. Click tool button again to see results.");
					  		// set cursor to custom for weather tool
					  		map.setOptions({draggableCursor:'crosshair'});
					  		  if (typeof poly != "undefined") {
					  		  	poly.setMap();
					  		  }
					  		  var polyOptions = {
								    strokeColor: '#000000',
								    strokeOpacity: 1.0,
								    strokeWeight: 3
								  };
								  poly = new google.maps.Polyline(polyOptions);
								  poly.setMap(map);
  								MyMapPolyListener = google.maps.event.addListener(map, 'click', function(event){
										  path = poly.getPath();									
										  // Because path is an MVCArray, we can simply append a new coordinate
										  // and it will automatically appear.
										  path.push(event.latLng);									  								  								
  								}); //listener function
						} // if else
};