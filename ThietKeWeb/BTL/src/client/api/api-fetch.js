;(function(){
	function computeBasePrefix() {
		var path = window.location.pathname || ''
		if (path.indexOf('/src/client/') !== -1) return '../../'
		if (path.indexOf('/src/admin/') !== -1) return '../../'
		return ''
	}

	function fetchJson(relativePath) {
		var base = computeBasePrefix()
		return fetch(base + relativePath, { headers: { 'Content-Type': 'application/json' } }).then(function(r){
			if(!r.ok) throw new Error('HTTP '+r.status)
			return r.json()
		})
	}

	window.MockAPI = {
		loadAll: function(){ return fetchJson('src/client/api/mock-data.json') },
		loadCars: function(){ return this.loadAll().then(function(d){ return d.cars || [] }) },
		loadUsers: function(){ return this.loadAll().then(function(d){ return d.users || [] }) }
	}
})()


