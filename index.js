Vue.component('mapbox',{
	template: '<div v-show="true" id="map" class="mapbox"></div>'
})

Vue.component('settings-menu', {
	template: '<div v-show="true" class="settings-menu">\
			<div class="title">\
			<h1>EPIDEMICSM</h1>\
			</div>\
			<div class="settings-column">\
				<input disabled="true" onchange="changeDate()" id="dateNow" type="date" id="dateNow"></input>\
				<span class="dateText">Hey select date</span>\
			</div>\
			<div class="settings-column">\
				<button onclick="launchButton()" class="simulation-button">Launch</button>\
				<button onclick="stopButton()" class="simulation-button">Stop</button>\
				<button onclick="resetButton()" class="simulation-button">Reset</button>\
			</div>\
			<div class="settings-column">\
				<button onclick="drawStartEpidemicDay()" class="simulation-button">Start point</button>\
			</div>\
			<div id="loadspindiv" class="settings-column">\
				<div id="loadspin" class="spinner-grow text-warning"></div>\
			</div>\
		</div>'
})

var main = new Vue({
	el: '#main'
})