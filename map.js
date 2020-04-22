mapboxgl.accessToken = 'pk.eyJ1Ijoic3lybSIsImEiOiJjazk1ZGJqZnEwNDJlM21tcHZxbnRwbW1tIn0.2GX6n3BUAz-c4vqDKb6dpw';

var countryInformation = null
var infoJson = null
var isLaunched = false

var frameIdx = 0
var FPS = 1
var drawnFrameIdx = 0
var interval = null

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
	})

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
	})

	map.on('mousemove', 'countries', function(e) {
		if (e.features.length > 0) {
			if (hoveredStateId) {
				popup.remove()
				countryInPopup = null
			}

			var postalId = currentSituationJson.data[drawnFrameIdx].countries[e.features[0].properties.ISO_A2];
			if (postalId) {
				hoveredStateId = e.features[0].id
				countryInPopup = e.features[0].properties.ISO_A2
				var message = '<strong>Country: </strong>'+postalId.countryName+'<br>\
							   <strong>Infected: </strong>'+postalId.infected+'<br>\
							   <strong>Recovered: </strong>'+postalId.recovered+'<br>\
							   <strong>Deaths: </strong>'+postalId.deaths;
				popup.setLngLat(e.lngLat).setHTML(message).addTo(map)
			}
		}
	});

	map.on('mouseleave', 'countries', function() {
		if (hoveredStateId) {
			popup.remove()
			countryInPopup = null
		}
		hoveredStateId = null
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

	map.getSource('countries').setData(countriesJson)
}

var loadInfoJson = function() {
	$.getJSON(srcData, function(pastinfoJson) {
		infoJson = pastinfoJson
		createLayer(pastinfoJson, countryInformation)

		minDate = Date.parse(infoJson.data[0].date)
		maxDate = Date.parse(infoJson.data[infoJson.data.length - 1].date)

		$("#dateNow").val(infoJson.data[0].date)
		$("#dateNow").prop("min", infoJson.data[0].date)
		$("#dateNow").prop("max", infoJson.data[infoJson.data.length - 1].date)
		$("#dateNow").prop("disabled", false)
		$("#loadspindiv").hide()
	});
}

map.on('load', function() {
	$.getJSON(srcGEO, function(countriesJson) {
		countryInformation = countriesJson
		loadInfoJson()
	});
});

var drawEpidemicDay = function() {
	if (map.getSource("countries")) {
		updateLayer(infoJson, countryInformation)
	} else {
		createLayer(infoJson, countryInformation)
	}
}

var nextDay = function() {
	if (frameIdx < infoJson.data.length) {
		$("#dateNow").val(infoJson.data[frameIdx].date)
		drawEpidemicDay()
		++frameIdx
	} else {
		stopButton()
	}
}

var launchButton = function() {
	if (infoJson && !isLaunched) {
		isLaunched = true
		$("#dateNow").prop("disabled", true)
		interval = setInterval(nextDay, 1000 / FPS)
	}
}

var resetButton = function() {
	if (infoJson) {
		frameIdx = 0
		$("#dateNow").val(infoJson.data[frameIdx].date)
		drawEpidemicDay()
	}
}

var stopButton = function() {
	if (isLaunched) {
		isLaunched = false
		clearInterval(interval)
		$("#dateNow").prop("disabled", false);
	}
}

var changeDate = function() {
	if (infoJson && !isLaunched) {
		nowDate = Date.parse($("#dateNow").val())

		if (isNaN(nowDate) || nowDate < minDate) {
			frameIdx = 0
			$("#dateNow").val($("#dateNow").prop("min"))
		} else if (nowDate > maxDate) {
			frameIdx = Math.ceil((maxDate - minDate) / (1000 * 3600 * 24))
			$("#dateNow").val($("#dateNow").prop("max"))
		} else {
			frameIdx = Math.ceil((nowDate - minDate) / (1000 * 3600 * 24))
		}
		
		drawEpidemicDay()
	}
}

var changeFPS = function() {
	var new_val = $("#framesPerSecond").val()
	$("#framesPerSecondText").text("FPS: " + new_val)
	FPS = new_val
	if (isLaunched) {
		clearInterval(interval)
		interval = setInterval(nextDay, 1000 / FPS)
	}
}
