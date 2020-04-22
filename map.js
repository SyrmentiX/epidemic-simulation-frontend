mapboxgl.accessToken = 'pk.eyJ1Ijoic3lybSIsImEiOiJjazk1ZGJqZnEwNDJlM21tcHZxbnRwbW1tIn0.2GX6n3BUAz-c4vqDKb6dpw';

const PAST = 0;
const FUTURE = 1;

var countryInformation;
var prevInfoJson;
var futureInfoJson;
var isLaunched = false;
var currentTimeLine = PAST;
var frameIdx = 0;
var FPS = 1
var drawnFrameIdx = 0
var screen = 0;
var interval;

var srcData = "http://104.248.59.99:8080/predict?duration=20"
var srcGEO = "http://104.248.59.99/ne_110m_admin_0_countries_fixed.geojson"

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11'
});

var hoveredStateId = null;

var popup = new mapboxgl.Popup({
	closeButton: false,
	closeOnClick: false
});
var countryInPopup;

var minDate = null
var maxDate = null

var repaintLayer = function(currentSituationJson, countriesJson) {
	for (var key in currentSituationJson.data[frameIdx].countries) {
		var p = Math.min(1.0, currentSituationJson.data[frameIdx].countries[key].infected * 2000 / currentSituationJson.data[frameIdx].countries[key].population)
		var r = Math.round(255 * p)
		var g = Math.round(255 * (1.0 - p))

		var color = "rgba(" + r + ", " + g + ", 0, 1)"
		currentSituationJson.data[frameIdx].countries[key].color = color
	}

	for (var i = 0; i < countriesJson.features.length; i++) {
		countriesJson.features[i].properties["color"] = 'transparent'
		for (var key in currentSituationJson.data[frameIdx].countries) {
			if (countriesJson.features[i].properties["ISO_A2"] == key) {
				countriesJson.features[i].properties["color"] = currentSituationJson.data[frameIdx].countries[key].color
				break
			}
		}
	}

	drawnFrameIdx = frameIdx
}

var createLayer = function(currentSituationJson, countriesJson) {
	repaintLayer(currentSituationJson, countriesJson)
	
	map.addSource('countries', {
		'type': 'geojson',
		'data': countriesJson
	});

	map.addLayer({
		'id': 'countries',
		'type': 'fill',
		'source': 'countries',
		'layout': {
			'visibility': 'visible',
		},
		'paint': {
			'fill-color': ['get', 'color'],
			'fill-opacity': 0.6,
			'fill-outline-color': 'rgba(200, 100, 240, 1)'					
	 	 }
	});

	map.on('mousemove', 'countries', function(e) {
		// map.getCanvas().style.cursor = 'pointer';
		if (e.features.length > 0) {
			if (hoveredStateId) {
				// map.getCanvas().style.cursor = '';
				popup.remove();
				countryInPopup = null
			}

			var postalId = currentSituationJson.data[drawnFrameIdx].countries[e.features[0].properties.ISO_A2];
			if (postalId) {
				hoveredStateId = e.features[0].id;
				countryInPopup = e.features[0].properties.ISO_A2
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
			// map.getCanvas().style.cursor = '';
			popup.remove();
			countryInPopup = null
		}
		hoveredStateId = null;
	});
}

var updateLayer = function(currentSituationJson, countriesJson) {
	repaintLayer(currentSituationJson, countriesJson)
	
	if (hoveredStateId) {
		var postalId = currentSituationJson.data[drawnFrameIdx].countries[countryInPopup];
		if (postalId) {
			var message = '<strong>Country: </strong>'+postalId.countryName+'<br>\
						   <strong>Infected: </strong>'+postalId.infected+'<br>\
						   <strong>Recovered: </strong>'+postalId.recovered+'<br>\
						   <strong>Deaths: </strong>'+postalId.deaths;
			popup.setHTML(message)
		} else {
			popup.remove()
			countryInPopup = null
			hoveredStateId = null
		}
	}

	map.getSource('countries').setData(countriesJson);
}

var loadPreviousData = function() {
	$.getJSON(srcData, function(pastinfoJson) {
		prevInfoJson = pastinfoJson;
		createLayer(pastinfoJson, countryInformation);
		minDate = Date.parse(prevInfoJson.data[0].date)
		maxDate = Date.parse(prevInfoJson.data[prevInfoJson.data.length - 1].date)
		$("#dateNow").val(prevInfoJson.data[0].date)
		$("#dateNow").prop("min", prevInfoJson.data[0].date)
		$("#dateNow").prop("max", prevInfoJson.data[prevInfoJson.data.length - 1].date)
		$("#dateNow").prop("disabled", false);
		$("#loadspindiv").hide();
	});
}

map.on('load', function() {
	$.getJSON(srcGEO, function(countriesJson) {
		countryInformation = countriesJson;
		loadPreviousData();
	});
});

var drawEpidemicDay = function(timeline) {
	if (timeline == PAST) {
		if (map.getSource("countries")) {
			updateLayer(prevInfoJson, countryInformation);
		} else {
			createLayer(prevInfoJson, countryInformation);
		}
	} else {
		createLayer(futureInfoJson, countryInformation);
	}
}

var nextDay = function() {
	if (currentTimeLine == PAST) {
		$("#dateNow").val(prevInfoJson.data[frameIdx].date)
		drawEpidemicDay(currentTimeLine);
		++frameIdx
		if (frameIdx == prevInfoJson.data.length) {
			currentTimeLine = FUTURE;
		}
	} else {
		stopButton();
		--frameIdx
	}
}

var launchButton = function() {
	if (prevInfoJson && !isLaunched) {
		isLaunched = true;
		$("#dateNow").prop("disabled", true);
		interval = setInterval(nextDay, 1000 / FPS);
	}
}

var resetButton = function() {
	if (prevInfoJson) {
		frameIdx = 0;
		currentTimeLine = PAST;
		$("#dateNow").val(prevInfoJson.data[frameIdx].date)
	}
}

var stopButton = function() {
	if (isLaunched) {
		isLaunched = false;
		$("#dateNow").prop("disabled", false);
		clearInterval(interval);
	}
}

var changeDate = function() {
	if (prevInfoJson && !isLaunched) {
		nowDate = Date.parse($("#dateNow").val())
		if (nowDate > maxDate) {
			frameIdx = Math.ceil((maxDate - minDate) / (1000 * 3600 * 24))
			$("#dateNow").val($("#dateNow").prop("max"))
		} else if (nowDate < minDate) {
			frameIdx = 0
			$("#dateNow").val($("#dateNow").prop("min"))
		} else {
			frameIdx = Math.ceil((nowDate - minDate) / (1000 * 3600 * 24))
		}
		
		drawEpidemicDay(currentTimeLine)
	}
}
