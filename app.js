var app = angular.module('edp_app', ['ui.router', 'ngIdle']);
app.controller('homeCtrl', ['$scope', 'CommonService', '$state', 'Idle', 'Keepalive', function($scope, CommonService, $state, Idle, Keepalive) {
	$scope.appName = "Enable/Disable Payload";
	
	$scope.projectDetails = [];
	$scope.serviceDetails = [];
	$scope.userDetails = JSON.parse(localStorage.getItem("userDetails")) || resetUserDetails();
	
	function resetUserDetails() {
		return $scope.userDetails = {
			name: "",
			token: ""
		};
	}
	
	function getProjects() {
		var config = {			
			method: 'POST',
			url: 'projectDetails.json',
			data: {
				token: $scope.userDetails.token
			}
		};
		CommonService.getDetails(config).then(
			function(successResponse) {
				if(successResponse.data.status === 'OK') {
					$scope.projectDetails = successResponse.data.result;
				} else {
					alert(successResponse.data.message);
				}
			},
			function(failureResponse) {
				alert(failureResponse);
			}
		);
	};

	$scope.getWebService = function(projName) {
		var config = {			
			method: 'POST',
			url: 'serviceDetails.json',
			data: {
				token: $scope.userDetails.token,
				projectName: projName
			}
		};
		CommonService.getDetails(config).then(
			function(successResponse) {
				if(successResponse.data.status === 'OK') {
					$scope.serviceDetails = successResponse.data.result;
				} else {
					alert(successResponse.data.message);
				}				
			},
			function(failureResponse) {
				alert(failureResponse);
			}
		);
	};
	
	$scope.enableWebService = function() {
		var config = {			
			method: 'POST',
			url: '',
			data: {
				token: $scope.userDetails.token,
				services: angular.copy($scope.serviceDetails)
			}
		};
		CommonService.getDetails(config).then(
			function(successResponse) {
				if(successResponse.data.status === 'OK') {
					alert('Request Processed Successfully');
				} else {
					alert(successResponse.data.message);
				}				
			},
			function(failureResponse) {
				alert(failureResponse);
			}
		);		
	};
	
	$scope.doLogout = function() {
		var config = {			
			method: 'POST',
			url: '',
			data: {
				token: $scope.userDetails.token,
				username: $scope.userDetails.name
			}
		};
		localStorage.removeItem("userDetails");
		resetUserDetails();
		CommonService.getDetails(config).then(
			function(successResponse) {
				if(successResponse.data.status === 'OK') {
					alert('Logged Out');
					$state.go('login');
				} else {
					alert(successResponse.data.message);
				}				
			},
			function(failureResponse) {
				alert(failureResponse);
			}
		);		
	};
	
	//Idel Time out stuff
	$scope.$on('IdleStart', function() {
		console.log('logged In');
	});

	$scope.$on('IdleTimeout', function() {
		$scope.doLogout();
	});

	$scope.start = function() {
		Idle.watch();		
	};

	$scope.stop = function() {
		Idle.unwatch();
	};
	
	
	(function init() {
		getProjects();
	})();
	
	
}]);

app.controller('loginCtrl', ['$scope', '$state', 'CommonService', function($scope, $state, CommonService) {
	
	$scope.doLogin = function(user) {
		var config = {			
			method: 'POST',
			url: 'userDetails.json',
			data: user
		};
		CommonService.getDetails(config).then(
			function(successResponse) {
				if(successResponse.data.status === 'OK') {
					localStorage.setItem('userDetails', JSON.stringify(successResponse.data.user));
					$state.go('home');					
				} else {
					alert(successResponse.data.message);
				}				
			},
			function(failureResponse) {
				alert(failureResponse);
			}
		);
	};
}]);

app.config(['$stateProvider', '$urlRouterProvider', 'KeepaliveProvider', 'IdleProvider', function($stateProvider, $urlRouterProvider, KeepaliveProvider, IdleProvider) {
  
   $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: "login.html",
	  controller: "loginCtrl"
    })
    .state('home', {
      url: "/home",
      templateUrl: "home.html",
      controller: "homeCtrl"
    });
	
	$urlRouterProvider.otherwise("/login");
	
	//Item time out config
	IdleProvider.idle(5000);
	IdleProvider.timeout(5000);
	KeepaliveProvider.interval(10000);
}]);

app.service('CommonService', ['$http', function($http) {
	var service = {};
	service.getDetails = function(config) {
		return $http(config);
	};	
	return service;
}]);

app.run(['Idle', function(Idle) {
  Idle.watch();
}]);