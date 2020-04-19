mapboxgl.accessToken = 'pk.eyJ1Ijoic3lybSIsImEiOiJjazk1ZGJqZnEwNDJlM21tcHZxbnRwbW1tIn0.2GX6n3BUAz-c4vqDKb6dpw';

const PAST = 0;
const FUTURE = 1;

var countryInformation;
var prevInfoJson;
var futureInfoJson;
var isLaunched = false;
var currentTimeLine = PAST;
var day = 0;
var interval;

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11'
});

var hoveredStateId = null;

var popup = new mapboxgl.Popup({
	closeButton: false,
	closeOnClick: false
});

var removeSource = function() {
	map.removeLayer('countries');
	map.removeSource('countries');
}

var drawLayers = function(currentSituationJson, countriesJson) {
	var midInfected = 0
	var countCountry = 0

    for (var key in currentSituationJson.data[day].countries) {
		midInfected += currentSituationJson.data[day].countries[key].infected
		countCountry++
	}
	midInfected /= countCountry

	for (var key in currentSituationJson.data[day].countries) {
		var p = Math.min(1.0, currentSituationJson.data[day].countries[key].infected / midInfected)
		var r = Math.round(255 * p)
		var g = Math.round(255 * (1.0 - p))

		var color = "rgba(" + r + ", " + g + ", 0, 1)"
		currentSituationJson.data[day].countries[key].color = color
	}

	for (var i = 0; i < countriesJson.features.length; i++) {
		countriesJson.features[i].properties["color"] = 'transparent'
		for (var key in currentSituationJson.data[day].countries) {
			if (countriesJson.features[i].properties["ISO_A2"] == key) {
				countriesJson.features[i].properties["color"] = currentSituationJson.data[day].countries[key].color
				break
			}
		}
	}
	
	document.getElementById("dateNow").value = currentSituationJson.data[day].date
	if (hoveredStateId) {
		map.getCanvas().style.cursor = '';
		popup.remove();
	}

	map.addSource('countries', {
		'type': 'geojson',
		'data': countriesJson
	});

	map.addLayer({
		'id': 'countries',
		'type': 'fill',
		'source': 'countries',
		'paint': {
			'fill-color': ['get', 'color'],
			'fill-opacity': 0.6,
			'fill-outline-color': 'rgba(200, 100, 240, 1)'					
	 	 }
	});

	map.on('mousemove', 'countries', function(e) {
		map.getCanvas().style.cursor = 'pointer';
		if (e.features.length > 0) {
			if (hoveredStateId) {
				map.getCanvas().style.cursor = '';
				popup.remove();
			}

			var postalId = currentSituationJson.data[day].countries[e.features[0].properties.ISO_A2];
			if (postalId != null) {
				hoveredStateId = e.features[0].id;
				var message = '<strong>Country: </strong>'+postalId.countryName+'<br>\
							   <strong>Infected: </strong>'+postalId.infected+'<br>\
							   <strong>Recovered: </strong>'+postalId.recovered+'<br>\
							   <strong>Deaths: </strong>'+postalId.deaths;
				popup.setLngLat(e.lngLat).setHTML(message).addTo(map);
			}
		}
	});

	map.on('mouseleave', 'countries', function() {
		if (hoveredStateId) {
			map.getCanvas().style.cursor = '';
			popup.remove();
		}
		hoveredStateId = null;
	});
}

var loadPreviousData = function() {
	$.getJSON("http://104.248.59.99:8080/JHUCSSE", function(pastinfoJson) {
		console.log(pastinfoJson);
		prevInfoJson = pastinfoJson;
		drawLayers(pastinfoJson, countryInformation);
	});
}

map.on('load', function() {
	$.getJSON("http://104.248.59.99/ne_110m_admin_0_countries_fixed.geojson", function(countriesJson) {
		console.log(countriesJson);
		countryInformation = countriesJson;
		loadPreviousData();
	});
});

var drawEpidemicDay = function(day, timeline) {
	removeSource();
	if (timeline == PAST) {
		drawLayers(prevInfoJson, countryInformation);
	} else {
		drawLayers(futureInfoJson, countryInformation);
	}
}

var drawStartEpidemicDay = function() {
	if (countryInformation != null && prevInfoJson != null) {
		day = 0;
		currentTimeLine = PAST
		drawEpidemicDay(day, currentTimeLine);
	}
}

var frameIdx = function() {
	if (currentTimeLine == PAST) {
		drawEpidemicDay(day, currentTimeLine);
		++day
		if (day == prevInfoJson.data.length) {
			day = 0;
			currentTimeLine = FUTURE;	
		}
	} else {
		stopButton();
		//drawEpidemicDay(day, currentTimeLine);
		//++day
	}
}

var launchButton = function() {
	if (prevInfoJson != null && isLaunched != true) {
		isLaunched = true;
		interval = setInterval(frameIdx, 1000);
	}
}

var resetButton = function() {
	if (prevInfoJson != null) {
		day = 0;
		currentTimeLine = PAST;
	}
}

var stopButton = function() {
	if (isLaunched == true) {
		isLaunched = false;
		clearInterval(interval);
	}
}