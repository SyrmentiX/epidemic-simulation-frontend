mapboxgl.accessToken = 'pk.eyJ1Ijoic3lybSIsImEiOiJjazk1ZGJqZnEwNDJlM21tcHZxbnRwbW1tIn0.2GX6n3BUAz-c4vqDKb6dpw';

var countryInformation;
var prevCountryInfo;
var isLaunched = false;
var step = 0;

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11'
});

var hoveredStateId = null;

var popup = new mapboxgl.Popup({
	closeButton: false,
	closeOnClick: false
});

var drawLayers = function(currentSituationJson, countriesJson) {
	var midInfected = 0
	var countCountry = 0
    for (var key in currentSituationJson.data[0].countries) {
		midInfected += currentSituationJson.data[0].countries[key].infected
		countCountry++
	}
	midInfected /= countCountry

	for (var key in currentSituationJson.data[0].countries) {
		var p = Math.min(1.0, currentSituationJson.data[0].countries[key].infected / midInfected)
		var r = Math.round(255 * p)
		var g = Math.round(255 * (1.0 - p))

		var color = "rgba(" + r + ", " + g + ", 0, 1)"
		currentSituationJson.data[0].countries[key].color = color
	}

	for (var i = 0; i < countriesJson.features.length; i++) {
		countriesJson.features[i].properties["color"] = 'transparent'
		for (var key in currentSituationJson.data[0].countries) {
			if (countriesJson.features[i].properties["POSTAL"] == key) {
				countriesJson.features[i].properties["color"] = currentSituationJson.data[0].countries[key].color
				break
			}
		}
	}
	console.log(countriesJson)

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

			var coordinates = e.features[0].geometry.coordinates.slice();
			while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
				coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
			}
			var postalId = currentSituationJson.data[].countries[e.features[0].properties.POSTAL];
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

var loadTodayData = function() {
	$.getJSON("http://104.248.59.99:8080/today", function(infoJson) {
		console.log(infoJson);
		drawLayers(infoJson, countryInformation);
	});
}

var loadPreviousData = function() {
	$.getJSON("http://104.248.59.99:8080/JHUCSSE", function(pastinfoJson) {
		console.log(pastinfoJson);
		prevCountryInfo = pastinfoJson;
	});
}

map.on('load', function() {
	$.getJSON("http://104.248.59.99/ne_110m_admin_0_countries_fixed.geojson", function(countriesJson) {
		console.log(countriesJson);
		countryInformation = countriesJson;
		loadTodayData();
	});
	loadPreviousData();
});

var onUpdate = function() {
	++step;
}

var launchButton = function() {
	if (prevCountryInfo != null && isLaunched != true) {

	}
}

var resetButton = function() {
	if (prevCountryInfo != null) {
		step = 0;
	}
}

var stopButton = function() {
	if (prevCountryInfo != null && isLaunched != true) {

	}
}
