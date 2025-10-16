;(function(){
	var api = {
		getCars: function(){ return window.MockAPI.loadCars() },
		getUsers: function(){ return window.MockAPI.loadUsers() },
		getCarById: function(id){ return this.getCars().then(function(c){ return c.find(function(x){ return x.id===id })||null }) }
	}
	window.API = api
})()


