mapboxgl.accessToken = 'pk.eyJ1Ijoic3lybSIsImEiOiJjazk1ZGJqZnEwNDJlM21tcHZxbnRwbW1tIn0.2GX6n3BUAz-c4vqDKb6dpw';

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11'
});

var curclesId = 0;

var markCountry = function(countryName) {
	countryName
	var json = "https://api.mapbox.com/geocoding/v5/mapbox.places/"+countryName+".json?access_token=pk.eyJ1Ijoic3lybSIsImEiOiJjazk1ZGJqZnEwNDJlM21tcHZxbnRwbW1tIn0.2GX6n3BUAz-c4vqDKb6dpw"
	var request = new XMLHttpRequest();
	request.open('GET', json)
	request.responseType = 'json';
	request.send();
	request.onload = function() {
		var coordinates = request.response;
	  	for (var i = coordinates.features.length - 1; i >= 0; i--) {
	  		if (coordinates.features[i].place_type[0] == "country") {
	  			writeCircle(coordinates.features[i]);
	  			return coordinates.features[i];
	  		}
	  	}
	  	return null;
	}
}

var writeCircle = function(country) {
	console.log(country);
	if (country != null) {
		map.addSource("polygon"+curclesId, createGeoJSONCircle(country.center, 100));

		map.addLayer({
		    "id": "polygon"+curclesId,
	    	"type": "fill",
    		"source": "polygon"+curclesId,
    		"layout": {},
    		"paint": {
	        	"fill-color": "blue",
    	    	"fill-opacity": 0.6
    		}
		});
		++curclesId;
	}
}

var createGeoJSONCircle = function(center, radiusInKm, points) {
    if (!points) points = 64;

    var coords = {
        latitude: center[1],
        longitude: center[0]
    };

    var km = radiusInKm;

    var ret = [];
    var distanceX = km/(111.320*Math.cos(coords.latitude*Math.PI/180));
    var distanceY = km/110.574;

    var theta, x, y;
    for(var i=0; i<points; i++) {
        theta = (i/points)*(2*Math.PI);
        x = distanceX*Math.cos(theta);
        y = distanceY*Math.sin(theta);

        ret.push([coords.longitude+x, coords.latitude+y]);
    }
    ret.push(ret[0]);

    return {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [ret]
                }
            }]
        }
    };
};

map.on('load', function() {
	markCountry("Russia Federation");
	markCountry("USA");
	markCountry("United Kingdom");
});