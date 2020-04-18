Vue.component('mapbox',{
	template: '<div v-show="true" id="map" class="mapbox"></div>'
})

Vue.component('settings-menu', {
	template: '<div v-show="true" class="settings-menu">\
			<div class="title">\
			<h1>EPIDEMICSM</h1>\
			</div>\
			<div class="settings-column">\
				<p>todo Timeline add calendar</p>\
			</div>\
			<div class="settings-column">\
				<button class="simulation-button">Launch</button>\
				<button class="simulation-button">Stop</button>\
				<button class="simulation-button">Reset</button>\
			</div>\
			<div class="settings-column">\
				<p>todo Presets</p>\
			</div>\
			<div class="top-column">\
				<p>todo Top Infected Country</p>\
			</div>\
		</div>'
})

var main = new Vue({
	el: '#main'
})