Vue.component('mapbox',{
	template: '<div v-show="true" id="map" style="width: 80%; height: 100%;"></div>'
})

Vue.component('menu', {
	template: '<div v-show="false">\
		\
		</div>'
})

var main = new Vue({
	el: '#main'
})