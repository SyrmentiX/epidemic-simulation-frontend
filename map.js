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
	map.addSource('countries', {
		'type': 'geojson',
		'data': countriesJson
	});

	map.addLayer({
		'id': 'countries',
		'type': 'fill',
		'source': 'countries',
		'paint': {
			'fill-color': 'red',
			'fill-opacity': [
				'case',
				['boolean', ['feature-state', 'hover'], false],
				1,
				0.5
			],
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