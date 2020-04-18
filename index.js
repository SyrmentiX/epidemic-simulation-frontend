Vue.component('button-counter', {
  data: function () {
    return {
      count: 0
    }
  },
  template: '<button v-on:click="count++">button counter {{ count }}</button>'
})

Vue.component('map',{
	template: '<div>\
		\
		</div>'
})

Vue.component('menu', {
	template: '<div>\
		\
		</div>'
})

var main = new Vue({
	el: '#main'
})