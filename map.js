mapboxgl.accessToken = 'pk.eyJ1Ijoic3lybSIsImEiOiJjazk1ZGJqZnEwNDJlM21tcHZxbnRwbW1tIn0.2GX6n3BUAz-c4vqDKb6dpw';

var countryInformation;

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11'
});

var drawLayers = function(coronaJson, countriesJson) {
	for (var i = countriesJson.features.length - 1; i >= 0; i--) {
		map.addSource('country'+countriesJson.features[i].properties.ADMIN, {
			'type': 'geojson',
			'data': countriesJson.features[i]
		});

	 	map.addLayer({
			'id': 'layer'+countriesJson.features[i].properties.ADMIN,
			'type': 'fill',
			'source': 'countries'+countriesJson.features[i].properties.ADMIN,
			'paint': {
				'fill-color': 'red',
				'fill-opacity': '0.6'
				'fill-outline-color': 'rgba(200, 100, 240, 1)'					
	 	 	}
		});
	}
}

var onUpdate = function() {
	$.getJSON("http://104.248.59.99:8080/today", function(infoJson) {
		console.log(infoJson);
		drawLayers(infoJson, countryInformation);	
	});
}

map.on('load', function() {
	$.getJSON("http://104.248.59.99/ne_110m_admin_0_countries.geojson", function(countriesJson) {
		console.log(countriesJson);
		countryInformation = countriesJson;
		onUpdate();
	});
});