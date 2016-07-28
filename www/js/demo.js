// 
// Here is how to define your module 
// has dependent on mobile-angular-ui
// 
var app = angular.module('MobileAngularUiExamples', [
  'Cordova',                                                   
  'ngRoute',
  'mobile-angular-ui',
  
  // touch/drag feature: this is from 'mobile-angular-ui.gestures.js'
  // it is at a very beginning stage, so please be careful if you like to use
  // in production. This is intended to provide a flexible, integrated and and 
  // easy to use alternative to other 3rd party libs like hammer.js, with the
  // final pourpose to integrate gestures into default ui interactions like 
  // opening sidebars, turning switches on/off ..
  'mobile-angular-ui.gestures'
  
]);


// 
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false' 
// in order to avoid unwanted routing.
// 
app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'templates/or-home.html', reloadOnSearch: false});
  
  $routeProvider.when('/mesurePrise',    {templateUrl: 'templates/or-mesure-prise.html', reloadOnSearch: false});
  $routeProvider.when('/mesureRecap',    {templateUrl: 'templates/or-mesure-recap.html', reloadOnSearch: false});
  $routeProvider.when('/mesureExpert',    {templateUrl: 'templates/or-mesure-expert.html', reloadOnSearch: false});
  $routeProvider.when('/mesureMano',    {templateUrl: 'templates/or-mesure-mano.html', reloadOnSearch: false});
  
  $routeProvider.when('/histo',    {templateUrl: 'templates/or-histo.html', reloadOnSearch: false});
  
  $routeProvider.when('/more',    {templateUrl: 'templates/or-more.html', reloadOnSearch: false});
  $routeProvider.when('/legal',    {templateUrl: 'templates/or-legal.html', reloadOnSearch: false});
  
  $routeProvider.when('/param',    {templateUrl: 'templates/or-param.html', reloadOnSearch: false});
  $routeProvider.when('/param2',    {templateUrl: 'templates/or-param2.html', reloadOnSearch: false});
  $routeProvider.when('/param3',    {templateUrl: 'templates/or-param3.html', reloadOnSearch: false});
  $routeProvider.when('/paramPubli',    {templateUrl: 'templates/or-param-publi.html', reloadOnSearch: false});
  $routeProvider.when('/paramConnex',    {templateUrl: 'templates/or-param-connexion.html', reloadOnSearch: false});
  
  $routeProvider.when('/test',    {templateUrl: 'templates/or-test.html', reloadOnSearch: false});
});


app.controller('MainController', function(cordovaReady,$rootScope, $scope,$location,$route){
	
	
	
	$scope.appName = "Openradiation";
	
	
	$scope.buttonHome = "off";
	$scope.state = "1";
	$scope.top="0";
	$scope.menu="1";
	
	$scope.modelEnv = 0;
	$scope.modelPos = 0;
	$scope.modelTags = "";
	$scope.modelDesc = "";
	
	//param
	$scope.expert_mode = 0;
	$scope.login = '';
	$scope.mdp='';
	
	$scope.iData = 0;
	$scope.dataDebug = {};
	
	
	if (!isMobile)
	{
		var locationPath = $location.path();
	 	if (locationPath != "/")
	 	{
	 		$scope.top="1";
	 	}
	 	if (locationPath == "/mesurePrise" || locationPath == "/mesureRecap" || locationPath == "/mesureExpert")
	 	{
	 		$scope.menu="0";
	 	}
	}
	

	 async.series([	
	               	function(callback){ cordovaReady(callback);},
	               	function(callback){init_DB(callback);},
	               		
	               	//create tables
	               	function(callback){createTableDevices(callback);},
	               	function(callback){createTableMeasures(callback);},
	               	function(callback){createTableParams(callback);},
	               	],
	               	
	   				 
	   				function(err, results ){
	   			 		console.log(results);
	   			 		//refreshDevices();
		   			 	//init state
		   			 	var locationPath = $location.path();
		   			 	if (locationPath != "/")
			   		 	{
			   		 		$scope.top="1";
			   		 	}
		   			 	if (locationPath == "/mesurePrise" || locationPath == "/mesureRecap" || locationPath == "/mesureExpert")
			   		 	{
			   		 		$scope.menu="0";
			   		 	}
		   			 	//recup param si existe
		   				getParam($scope);
		   				console.log($scope);
		   				
		 
	   		         }
	   		 );//fin  async.series*/
	 
	 $scope.stylemobile = function(){
	 
		 if (typeof rfduino == 'undefined')
				return true;
		 else
			 return false;
	 }
	 
	$scope.buttonSearchCapteur = function(clickEvent){
		
	
		if (typeof rfduino == 'undefined')
		//cas emulation chrome
		{
			fakeBluetoothDeviceSearch($scope);
			//fakeSearch($scope);
		}
		else
		{
			rfduino.isEnabled(
					function() {doBluetoothDeviceSearch($scope);},
				    function() {alertNotif("Bluetooth is *not* enabled","Attention","Ok")}
				);
		}
		
	}
	
	$scope.goHome = function(clickEvent){
		console.log('goHome');
		if ($scope.connectedDevice)
			$scope.state = 3;
		$location.path('/');
		$scope.top = "0";
		$scope.menu="1";
	}
	
	$scope.doMesure = function(clickEvent){
		console.log('doMesure');
		$location.path('/mesurePrise');
		$scope.top = "1";
		$scope.menu="0";
		
		$scope.mesure = {};
		$scope.mesure.total = 0 ;
		$scope.mesure.log = {}
		$scope.mesure.encours = true;
		$scope.mesure.timedeb = parseInt(new Date().getTime()/1000);
		
		$scope.mesure.latitude = 0;
		$scope.mesure.longitude = 0;
		$scope.mesure.gps = 1;
		$scope.mesure.temperature = -1000;
		$scope.mesure.env = 0;
		$scope.mesure.position = 0;
		$scope.mesure.tags = "tags";
		$scope.mesure.notes = "notes";
		$scope.mesure.valeurnsv = 0;
		$scope.mesure.duration = 0;
		if (typeof navigator.geolocation != 'undefined')
			navigator.geolocation.getCurrentPosition(function (position){
				$scope.mesure.latitude = position.coords.latitude;
				$scope.mesure.longitude = position.coords.longitude;
			},function (error) {
		        alert('code: '    + error.code    + '\n' +
		                'message: ' + error.message + '\n');
		      });
		
		if (typeof rfduino == 'undefined')
		//cas emulation chrome
		{
			fakeMesure($scope);
		}
		else
		{
			$scope.setTension($scope.connectedDevice.uuid);
			//var i = 0;
			rfduino.onData(function(data){
				if ($scope.mesure.encours)
					var myData = getData(data)
					for (var key in myData) {
						if (myData.hasOwnProperty(key)) {
							if (key == "5")
							{
								var mytimestamp = parseInt(new Date().getTime()/1000);
								var duration = mytimestamp - $scope.mesure.timedeb
								$scope.mesure.duration = duration;
								$scope.mesure.total += myData[key].data;
								$scope.mesure.moymin = ($scope.mesure.total / duration * 60).toFixed(2);
								$scope.mesure.valeurnsv = convertNanosievert($scope.mesure.total,duration);
								$scope.mesure.log[mytimestamp] = {}
								$scope.mesure.log[mytimestamp].timestamp = mytimestamp;
								$scope.mesure.log[mytimestamp].coup = myData[key].data;
								
								$scope.$apply();
								doProgressBar($scope.mesure.total);
								//i++;
							}
							if (key == "6")
							{
								$scope.mesure.temperature = myData[key].data;
								
								$scope.$apply();
							}
						}
					}
			},
			function(error){alertNotif(deviceId+" onData error : "+error,"Failure","Ok")});
			
		}
	}
	
	$scope.endMesure = function(clickEvent){
		
		
		
		console.log('endMesure');
		$location.path('/mesureRecap');
		$scope.top = "1";
		$scope.menu="0";
		$scope.mesure.encours = false;
		// fakeMesure($scope);
	}
	
	$scope.doExpert = function(clickEvent){
		console.log('doExpert');
		$location.path('/mesureExpert');
		$scope.top = "1";
		$scope.menu="0";
		// fakeMesure($scope);
	}
	
	
	
	$scope.validMesure = function(clickEvent){
		
		console.log($scope.modelEnv);
		
		$scope.mesure.env = $scope.modelEnv;
		$scope.mesure.position = $scope.modelPos;
		$scope.mesure.tags = $scope.modelTags;
		$scope.mesure.notes = $scope.modelDesc;
	/*	$scope.mesure.position = 0;
		$scope.mesure.tags = "tags";
		$scope.mesure.notes = "notes";*/
		
		resetMesureForm($scope);
		
		insertMeasures($scope,$scope.mesure,$scope.connectedDevice);
		
		console.log('validMesure');
		$scope.top = "0";
		$scope.menu="1";
		//$scope.state="1";
		$location.path('/');
		//$location.path('/mesureRecap');
		//$scope.top = "1";
		// fakeMesure($scope);
	}
	
	$scope.doHisto = function(clickEvent){
		
		getMeasures($scope);
		console.log($scope.measures);
		console.log('doHisto');
		$location.path('/histo');
		$scope.top = "1";
		//$scope.menu="0";
		 //fakeMesure($scope);
	}
	
	$scope.doSend  = function(id){
		sendMeasures($scope,id);
	}
	
	$scope.doParam = function(clickEvent){
		console.log('doParam');
		$location.path('/param');
		$scope.top = "1";
		//$scope.menu="0";
		 //fakeMesure($scope);
	}
	
	$scope.doParam2 = function(clickEvent){
		console.log('doParam2');
		$location.path('/param2');
		$scope.top = "1";
		
		if (typeof rfduino == 'undefined')
			//cas emulation chrome
			{
				 fakeBluetoothDeviceSearch($scope);
			}
			else
			{
				//ble.isEnabled(
				rfduino.isEnabled(
						function() {doBluetoothDeviceSearch($scope);},
					    function() {alertNotif("Bluetooth is *not* enabled","Attention","Ok")}
					);
			}
		
		
		//$scope.menu="0";
		 //fakeMesure($scope);
	}
	
	$scope.doParam3 = function(clickEvent){
		console.log('doParam3');
		$location.path('/param3');
		$scope.top = "1";
		
		if (typeof rfduino == 'undefined')
			//cas emulation chrome
			{
				 //fakeBluetoothDeviceSearch($scope);
			}
			else
			{
				//ble.isEnabled(
				/*rfduino.isEnabled(
						function() {doBluetoothDeviceSearch($scope);},
					    function() {alertNotif("Bluetooth is *not* enabled","Attention","Ok")}
					);*/
			}
	}
	
	$scope.doParamPubli = function(clickEvent){
		console.log('doParam');
		$location.path('/paramPubli');
		$scope.top = "1";
		//$scope.menu="0";
		 //fakeMesure($scope);
	}
	
	$scope.doParamConnex = function(clickEvent){
		console.log('doParamConnex');
		$location.path('/paramConnex');
		$scope.top = "1";
		//$scope.menu="0";
		 //fakeMesure($scope);
	}
	$scope.doConnex= function(clickEvent){
		console.log('doConnex');
		console.log($scope.login);
		console.log($scope.mdp);
		testUser($scope,$location);
//		$location.path('/paramConnex');

		//$scope.menu="0";
		 //fakeMesure($scope);
	}
	
	$scope.doDeconnex = function(clickEvent){
		console.log('doDeconnex');
		$scope.connexion.connexion = false;
		saveParam('connexion',0,'');
		$scope.$apply();
	}
	
	$scope.doCarto = function(clickEvent){
		console.log('doCarto');
		
		
		if (typeof navigator.geolocation != 'undefined')
			navigator.geolocation.getCurrentPosition(function (position){
				var latitude = position.coords.latitude;
				var longitude = position.coords.longitude;
				var zoom = 12;
				uri = "https://request.open-radiation.net/openradiation/"+zoom+"/"+latitude+"/"+longitude;
				window.open(uri, '_blank', 'location=no,closebuttoncaption=Fermer');
				
			},function (error) {
				uri = "https://request.open-radiation.net/openradiation";
				window.open(uri, '_blank', 'location=no,closebuttoncaption=Fermer');
		      });
	}
	
	$scope.doMore= function(clickEvent){
		clickEvent.preventDefault();
		console.log('doMore');
		$location.path('/more');
		$scope.top = "1";
		$scope.menu="1";
		 //fakeMesure($scope);
	}
	
	$scope.doMesureMano= function(clickEvent){
		clickEvent.preventDefault();
		console.log('doMesureMano');
		
		$scope.mesure = {};
		$scope.mesure.total = 0 ;
		$scope.mesure.log = {}
		$scope.mesure.encours = true;
		$scope.mesure.timedeb = parseInt(new Date().getTime()/1000);
		
		$scope.mesure.latitude = 0;
		$scope.mesure.longitude = 0;
		$scope.mesure.gps = 1;
		$scope.mesure.temperature = 0;
		$scope.mesure.env = 0;
		$scope.mesure.position = 0;
		$scope.mesure.tags = "tags";
		$scope.mesure.notes = "notes";
		$scope.mesure.valeurnsv = 0;
		$scope.mesure.duration = 0;
		if (typeof navigator.geolocation != 'undefined')
			navigator.geolocation.getCurrentPosition(function (position){
				$scope.mesure.latitude = position.coords.latitude;
				$scope.mesure.longitude = position.coords.longitude;});
		
		$location.path('/mesureMano');
		$scope.top = "1";
		$scope.menu="0";
		 //fakeMesure($scope);
	}
	
	$scope.validMesureMano = function(clickEvent){

		$scope.mesure.duration = $scope.modelDuration;
		$scope.mesure.valeurnsv = $scope.modelRadiation;
		$scope.mesure.total = $scope.modelTotal;
		$scope.mesure.temperature = $scope.modelTemperature;
		$scope.mesure.env = $scope.modelEnv;
		$scope.mesure.position = $scope.modelPos;
		$scope.mesure.tags = $scope.modelTags;
		$scope.mesure.notes = $scope.modelDesc;

		resetMesureForm($scope);
		
		insertMeasures($scope,$scope.mesure,$scope.connectedDevice);
		
		console.log('validMesureMano');
		$scope.top = "0";
		$scope.menu="1";
		//$scope.state="1";
		$location.path('/');
		//$location.path('/mesureRecap');
		//$scope.top = "1";
		// fakeMesure($scope);
	}
	
	$scope.devices = {};
	$scope.connectedDevice = 0;
	
	$scope.doTest = function(clickEvent){
		console.log('doTest');
		$location.path('/test');
		$scope.top = "1";
		
		if (typeof rfduino == 'undefined')
			//cas emulation chrome
			{
				 fakeBluetoothDeviceSearch($scope);
			}
			else
			{
				//ble.isEnabled(
				rfduino.isEnabled(
						function() {doBluetoothDeviceSearch($scope);},
					    function() {alertNotif("Bluetooth is *not* enabled","Attention","Ok")}
					);
			}
		
		
			//$scope.menu="0";
		 //fakeMesure($scope);
	}
	
	$scope.doConnect = function(device){
		if (typeof rfduino == 'undefined')
			//cas emulation chrome
			{
				$scope.connectedDevice = device;
				$scope.$apply();
			}
			else
			{
				rfduino.connect(device.uuid,
						function() {
							//success
							alertNotif(device.uuid+" connecté","Success","Ok");
							//$scope.connectedDeviceId = device.uuid;
							$scope.connectedDevice = device;
							
							$scope.$apply();
							

						},
					    function() {alertNotif(deviceId+" non connecté","Failure","Ok")}
					);
			}
	}
	
	$scope.doDisconnect= function(deviceId){
		if (typeof rfduino == 'undefined')
			//cas emulation chrome
			{
				$scope.connectedDevice = 0;
				$scope.$apply();
			}
			else
			{
				rfduino.disconnect(deviceId,
					function() {
						//success
						alertNotif(deviceId+" déconnecté","Success","Ok");
						$scope.connectedDevice = 0;
						$scope.$apply();

					},
					function() {alertNotif(deviceId+" non déconnecté","Failure","Ok")}
				);
			}
	}
	
	$scope.doData = function(deviceId){
		rfduino.onData(function(data){
			$scope.length = data.byteLength;
			var dataView = new DataView(data);
			offset =0
			var myData = getDataTest(data)
			$scope.data = JSON.stringify(myData);
			$scope.dataDebug[$scope.iData] = myData;
			$scope.iData++;
			//$scope.data2 = arrayBufferToFloat(data);
			$scope.$apply();
		},
		function(error){alertNotif(deviceId+" onData error : "+error,"Failure","Ok")});
	}
	
	$scope.doDataTension1 = function(deviceId){
		$scope.setTension(deviceId);
		rfduino.onData(function(data){
			$scope.length = data.byteLength;
			var dataView = new DataView(data);
			offset =0
			var myData = getDataTest(data)
			$scope.data = JSON.stringify(myData);
			$scope.dataDebug[$scope.iData] = myData;
			$scope.iData++;
			//$scope.data2 = myData;
			//$scope.data2 = arrayBufferToFloat(data);
			$scope.$apply();
		},
		function(error){alertNotif(deviceId+" onData error : "+error,"Failure","Ok")});
	}
	$scope.doDataTension2 = function(deviceId){
		$scope.setTension(deviceId);
		setTimeout(function(){
			rfduino.onData(function(data){
				$scope.length = data.byteLength;
				var dataView = new DataView(data);
				offset =0
				var myData = getDataTest(data)
				$scope.data = JSON.stringify(myData);
				$scope.dataDebug[$scope.iData] = myData;
				$scope.iData++;
				//$scope.data2 = myData;
				//$scope.data2 = arrayBufferToFloat(data);
				$scope.$apply();
			},
			function(error){alertNotif(deviceId+" onData error : "+error,"Failure","Ok")});
		},500);
	}
	$scope.doDataTension3 = function(deviceId){
		
		$scope.setTension(deviceId);
		setTimeout(function(){
			rfduino.onData(function(data){
				$scope.length = data.byteLength;
				var dataView = new DataView(data);
				offset =0
				var myData = getDataTest(data)
				$scope.data = JSON.stringify(myData);
				$scope.dataDebug[$scope.iData] = myData;
				$scope.iData++;
				//$scope.data2 = myData;
				$scope.$apply();
			},
			function(error){alertNotif(deviceId+" onData error : "+error,"Failure","Ok")});
		},1000);
	}
	$scope.doDataTension4 = function(deviceId){
		$scope.setTension(deviceId);
		setTimeout(function(){
			rfduino.onData(function(data){
				$scope.length = data.byteLength;
				var dataView = new DataView(data);
				offset =0
				var myData = getDataTest(data)
				$scope.data = JSON.stringify(myData);
				$scope.dataDebug[$scope.iData] = myData;
				$scope.iData++;
				//$scope.data2 = myData;
				//$scope.data2 = arrayBufferToFloat(data);
				$scope.$apply();
			},
			function(error){alertNotif(deviceId+" onData error : "+error,"Failure","Ok")});
		},2000);
	}
	$scope.doDataTension5 = function(deviceId){
		$scope.setTension(deviceId);
		setTimeout(function(){
			rfduino.onData(function(data){
				$scope.length = data.byteLength;
				var dataView = new DataView(data);
				offset =0
				var myData = getDataTest(data)
				$scope.data = JSON.stringify(myData);
				$scope.dataDebug[$scope.iData] = myData;
				$scope.iData++;
				//$scope.data2 = myData;
				//$scope.data2 = arrayBufferToFloat(data);
				$scope.$apply();
			},
			function(error){alertNotif(deviceId+" onData error : "+error,"Failure","Ok")});
		},5000);
	}
	
	$scope.doWrite1 = function(deviceId){
		var data = new ArrayBuffer(2);
		data[0]=0x01;
		data[1]=0x00;
		rfduino.write(data.buffer,function() {
							//success
							alertNotif(deviceId+" succes Write1 off","Success","Ok");

						},
					    function() {alertNotif(deviceId+" failure Write1 off","Failure","Ok")}
		);
	}
	$scope.doWrite2 = function(deviceId){
		var data = new Uint8Array(5);
		data[0]=0x11;
		//data[0]=0x88;
		var tension = 380;
		//data[1]="0x"+tension.toString(16);
		data[4]=0x43;
		//data[3]=0xBE;
		data[3]=0xBE;
		data[2]=0x80;
		data[1]=0x00;
		
		rfduino.write(data.buffer,function() {
			//success
			alertNotif(deviceId+" succes 43 BE tension on","Success","Ok");

			},
		    function() {alertNotif(deviceId+" failure tension on","Failure","Ok")}
		);
	}
	
	$scope.doWriteAskInfo = function(deviceId){
		var data = new Uint8Array(1);
		data[0]=IN_PACKET_SEND_INFO;
		
		
		rfduino.write(data.buffer,function() {
			//success
			//alertNotif(deviceId+" succes send info","Success","Ok");

			},
		    function() {alertNotif(deviceId+" failure send info","Failure","Ok")}
		);
	}
	$scope.doWriteChangeSilence = function(deviceId,silencieux){
		var data = new Uint8Array(2);
		data[0]=IN_PACKET_SILENT;
		data[1]=0x00;
		if(silencieux==1)data[1]=0x01;
		
		rfduino.write(data.buffer,function() {
			//success
			//alertNotif(deviceId+" succes send info","Success","Ok");

			},
		    function() {alertNotif(deviceId+" failure send silence","Failure","Ok")}
		);
	}
	//set_tension
	$scope.doWrite3 = function(deviceId){
		/*var data = new Uint8Array(3);
		data[0]=0x5;
		//data[0]=0x88;
		var tension = 380;
		//data[1]="0x"+tension.toString(16);
		data[1]=0x6;
		data[2]=0x7;
		data[3]=0x00;
		data[4]=0x00;
		
		rfduino.write(data.buffer,function() {
			//success
			alertNotif(deviceId+" succes FF 78 tension on","Success","Ok");

			},
		    function() {alertNotif(deviceId+" failure tension on","Failure","Ok")}
		);*/
		$scope.setTension(deviceId);
		
	}
	
	//set_tension
	$scope.setTension = function(deviceId){
		var data = new Uint8Array(5);
		data[0]=0x11;
		var tension = 380;
		//data[1]="0x"+tension.toString(16);
		data[4]="0x43";
		data[3]="0xBE";//data[3]="0xBE";
		data[2]="0x80";
		data[1]="0x00";
		
		rfduino.write(data.buffer,function() {
			//success
			//alertNotif(deviceId+" succes tension on","Success","Ok");

			},
		    function() {alertNotif(deviceId+" failure tension on","Failure","Ok")}
		);
	}
	
	
	
	
	
	
	//funcion convert affichage
	$scope.getDate = function (ts) {
		return convertTimestampToDate(ts);
	}
	
	$scope.getTime = function (ts) {
		return convertTimestampToTime(ts);
	}
	
	$scope.getDuration = function (duration) {
		return convertDurationForDisplay(duration);
	}
	
	//function param
	$scope.saveExpert = function () {
		value = ($scope.expert_mode?1:0);
		saveParam('expert_mode',value,'');
	}
	
	$scope.savePubliAuto = function () {
		value = ($scope.publi_auto?1:0);
		saveParam('publi_auto',value,'');
	}


  // User agent displayed in home page
  $scope.userAgent = navigator.userAgent;
  
  // Needed for the loading screen
  $rootScope.$on('$routeChangeStart', function(){
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function(){
	  var locationPath = $location.path();
	 	if (locationPath != "/")
	 	{
	 		$scope.top="1";
	 	}
	 	else
	 		$scope.top="0";
	 	if (locationPath == "/mesurePrise" || locationPath == "/mesureRecap" || locationPath == "/mesureExpert")
	 	{
	 		$scope.menu="0";
	 	}
	 	else
	 		$scope.menu="1";
    $rootScope.loading = false;
  });
  
  
  /// openradiation
 // $("#deviceList").touchend(connect);
  
  $scope.getData = function(clickEvent){
	  console.log("getData");
	  alert('getData');
	  $('#stateData span').html('En cours');
	  //rfduino.onData(onData, onRfError);
	  
	  $("#deviceList").on('touchend',connect);
	  //$("#deviceList").on('click',connect);
	  //$("#deviceList").touchend(connect);
	  }
  
  $scope.stopData = function(clickEvent){
	  console.log("stopData");
	  $('#stateData span').html('Stop');}
});

//CORDOVA
angular.module('Cordova', [])
.factory('cordovaReady', function(){
  return function(done) {
    if (typeof window.cordova === 'object') {
      document.addEventListener('deviceready', function () {
    	  console.log('cordovaready');
       // done();
    	  done(null,'cordoveaok');
      }, false);
    } else {
      done();
      done(null,'cordoveako');
    }
  };
});
