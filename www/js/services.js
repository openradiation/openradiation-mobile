angular.module('starter.services', [])
.factory('Questions', function($http) {
	return {
		all: function(query) {
			//console.log('http://restitution.altotoc.fr/services/questions/'+query.sid);
			return $http.get('http://restitution.altotoc.fr/services/questions/'+query.sid)
		}
	};
})

.factory('Charts', function($http) {
	return {
		all: function(query) {
			//console.log('http://restitution.altotoc.fr/services/data/'+query.sid+'/'+query.in+'/'+query.out);
			return $http.get('http://restitution.altotoc.fr/services/data/'+query.sid+'/'+query.in+'/'+query.out)
		}
	};
});
