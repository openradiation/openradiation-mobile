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
	
	$scope.mesure={};
	$scope.mesure.encours = false;
	
	$scope.iData = 0;
	$scope.dataDebug = {};
	
	$scope.gps ="error";
	
	
	
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
		 				console.log(err);
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
		   				testGPS($scope,true);
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
		if (typeof navigator.geolocation != 'undefined')
			navigator.geolocation.getCurrentPosition(
				function (position){
					//gps activé et ok
					if ($scope.connectedDevice!=0)
					{
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
						
						getGPS($scope); 
						
						if (typeof rfduino == 'undefined')
						{
							//cas emulation chrome
							fakeBluetoothDeviceInfos($scope);
							fakeMesure($scope);
						}
						else
						{
							$scope.setTension($scope.connectedDevice.uuid);
							doOnData(rfduino,$scope);
							doAskBluetoothDeviceInfos(rfduino);
						}
					}
				},//fin gps activé et ok
				function (error) {
					
					/*PositionError.PERMISSION_DENIED = 1;
					PositionError.POSITION_UNAVAILABLE = 2;
					PositionError.TIMEOUT = 3;*/
					$scope.gps = 'error';
					$scope.$apply();
					if (error.code == 1)
						alertNotif("L'application ne peut accéder à la localisation. Veuillez lui en donner l'autorisation","Erreur localisation",'Ok');
					if (error.code == 2)
						alertNotif("La localisation ne semble pas activée. Veuillez l'activer.","Erreur localisation",'Ok');
					if (error.code == 2)
						alertNotif("La localisation n'est pas disponible.","Erreur localisation",'Ok');
			      });
	}
	
	$scope.endMesure = function(clickEvent){
		console.log('endMesure');
		$location.path('/mesureRecap');
		$scope.top = "1";
		$scope.menu="0";
		$scope.mesure.encours = false;
	}
	
	$scope.doExpert = function(clickEvent){
		console.log('doExpert');
		$location.path('/mesureExpert');
		$scope.top = "1";
		$scope.menu="0";
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
		$location.path('/');
	}
	
	$scope.doHisto = function(clickEvent){
		
		getMeasures($scope);
		console.log($scope.measures);
		console.log('doHisto');
		$location.path('/histo');
		$scope.top = "1";
	}
	
	$scope.doSend  = function(id){
		sendMeasures($scope,id);
	}
	
	$scope.doDelete  = function(id){
		titre = "Historique";
		message = "Êtes-vous sûr(e) de vouloir supprimer cette mesure";
		if (isMobile)
			navigator.notification.confirm(
					message,  			
				    function(buttonIndex){/*alert ("Vous bouton sélectionné " + buttonIndex);*/if (buttonIndex==1)deleteMeasures($scope,id);},      
				    titre,
				    [ 'Oui','Non' ]
				);
			else
				if (confirm(titre+"\n\n"+message))
					deleteMeasures($scope,id);
	}
	
	$scope.doParam = function(clickEvent){
		console.log('doParam');
		$location.path('/param');
		$scope.top = "1";
	}
	
	$scope.doParam2 = function(clickEvent){
		console.log('doParam2');
		$location.path('/param2');
		$scope.top = "1";
		
		if (typeof rfduino == 'undefined')	
		{
			//cas emulation chrome
			fakeBluetoothDeviceSearch($scope);
		}
		else
		{
			rfduino.isEnabled(
					function() {doBluetoothDeviceSearch($scope);},
				    function() {alertNotif("Bluetooth is *not* enabled","Attention","Ok")}
				);
		}
	}
	
	$scope.doParam3 = function(clickEvent){
		console.log('doParam3');
		$location.path('/param3');
		$scope.top = "1";
		
		if (typeof rfduino == 'undefined')
		{
			//cas emulation chrome
			fakeBluetoothDeviceInfos($scope);
		}
		else
		{
			doOnData(rfduino,$scope);
			doAskBluetoothDeviceInfos(rfduino);
		}
	}
	
	$scope.doParamPubli = function(clickEvent){
		console.log('doParam');
		$location.path('/paramPubli');
		$scope.top = "1";
	}
	
	$scope.doParamConnex = function(clickEvent){
		console.log('doParamConnex');
		$location.path('/paramConnex');
		$scope.top = "1";
	}
	
	$scope.doConnex= function(clickEvent){
		console.log('doConnex');
		console.log($scope.login);
		console.log($scope.mdp);
		testUser($scope,$location);
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
				uri = INAPPBROWSER_URI + "/"+zoom+"/"+latitude+"/"+longitude;
				window.open(uri, '_blank', 'location=no,closebuttoncaption=Fermer');
				
			},function (error) {
				uri = INAPPBROWSER_URI;
				window.open(uri, '_blank', 'location=no,closebuttoncaption=Fermer');
		      });
	}
	
	$scope.doMore= function(clickEvent){
		clickEvent.preventDefault();
		console.log('doMore');
		$location.path('/more');
		$scope.top = "1";
		$scope.menu="1";
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
		getGPS($scope);
		/*if (typeof navigator.geolocation != 'undefined')
			navigator.geolocation.getCurrentPosition(
				function (position){
					$scope.mesure.latitude = position.coords.latitude;
					$scope.mesure.longitude = position.coords.longitude;
					if (position.coords.accuracy > 5)
						$scope.gps = "bad";
					else
						$scope.gps = "good";
				});*/
		
		$location.path('/mesureMano');
		$scope.top = "1";
		$scope.menu="0";
		$scope.$apply();
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
		$location.path('/');
	}
	
	$scope.devices = {};
	$scope.connectedDevice = 0;
	
	$scope.doTest = function(clickEvent){
		console.log('doTest');
		$location.path('/test');
		$scope.top = "1";
		testGPS($scope,true);
		
		if (typeof rfduino == 'undefined')
		{
			//cas emulation chrome
			 fakeBluetoothDeviceSearch($scope);
		}
		else
		{
			rfduino.isEnabled(
					function() {doBluetoothDeviceSearch($scope);},
				    function() {alertNotif("Bluetooth is *not* enabled","Attention","Ok")}
				);
		}
	}
	
	$scope.doConnect = function(device){
		if (typeof rfduino == 'undefined')
			//cas emulation chrome
			{
				$scope.connectedDevice = device;
				setConnectedDevice($scope);
				//$scope.$apply();
			}
			else
			{
				rfduino.connect(device.uuid,
						function() {
							//success
							$scope.connectedDevice = device;
							setConnectedDevice($scope);
							//$scope.$apply();
							

						},
					    function() {alertNotif(deviceId+" non connecté","Failure","Ok")}
					);
			}
	}
	
	$scope.doDisconnect= function(deviceId){
		if (typeof rfduino == 'undefined')
		{
			//cas emulation chrome
			$scope.connectedDevice = 0;
			$scope.$apply();
		}
		else
		{
			rfduino.disconnect(deviceId,
				function() {
					//success
					$scope.connectedDevice = 0;
					$scope.$apply();

				},
				function() {alertNotif(deviceId+" non déconnecté","Failure","Ok")}
			);
		}
	}
	
	// test
	$scope.doData = function(deviceId){
		rfduino.onData(function(data){
			$scope.length = data.byteLength;
			var dataView = new DataView(data);
			offset =0
			var myData = getData(data);
			$scope.data = JSON.stringify(myData);
			$scope.dataDebug[convertIdDebug($scope.iData)] = myData;
			$scope.iData++;
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
			var myData = getData(data);
			$scope.data = JSON.stringify(myData);
			$scope.dataDebug[convertIdDebug($scope.iData)] = myData;
			$scope.iData++;
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
				var myData = getData(data);
				$scope.data = JSON.stringify(myData);
				$scope.dataDebug[convertIdDebug($scope.iData)] = myData;
				$scope.iData++;
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
				var myData = getData(data);
				$scope.data = JSON.stringify(myData);
				$scope.dataDebug[convertIdDebug($scope.iData)] = myData;
				$scope.iData++;
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
				var myData = getData(data);
				$scope.data = JSON.stringify(myData);
				$scope.dataDebug[convertIdDebug($scope.iData)] = myData;
				$scope.iData++;
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
				var myData = getData(data);
				$scope.data = JSON.stringify(myData);
				$scope.dataDebug[convertIdDebug($scope.iData)] = myData;
				$scope.iData++;
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
		doAskBluetoothDeviceInfos(rfduino);
	}
	$scope.doWriteChangeSilence = function(deviceId,silencieux){
		var data = new Uint8Array(2);
		data[0]=IN_PACKET_SILENT;
		data[1]=0x00;
		if(silencieux==1)data[1]=0x01;
		
		rfduino.write(data.buffer,function() {
			//success
			},
		    function() {alertNotif(deviceId+" failure send silence","Failure","Ok")}
		);
	}
	//set_tension
	$scope.doWrite3 = function(deviceId){
		$scope.setTension(deviceId);
	}
	//fin test
	
	//set_tension
	$scope.setTension = function(deviceId){
		var data = new Uint8Array(5);
		data[0]=0x11;
		var tension = 380;

		data[4]="0x43";
		data[3]="0xBE";
		data[2]="0x80";
		data[1]="0x00";
		
		rfduino.write(data.buffer,function() {
			//success
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
	
	//function param pour device
	$scope.saveAudioHits = function () {
		setConnectedDeviceInfos($scope,"audioHits");
	}
	
	$scope.saveVisualHits = function () {
		setConnectedDeviceInfos($scope,"visualHits");
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
