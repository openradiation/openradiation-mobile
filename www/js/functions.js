var async = require('../dist/js/async.js');

////////////////////
//DB

//DB common
function errorHandler(tx, error) {
    console.log("Error: " + error.message);
}
function successHandler(tx, result) {
    console.log("Success: " + result);
}

// DB init
function init_DB(callback)
{
	//init base
	if(isMobile)
    	db = window.sqlitePlugin.openDatabase("Database", "1.0", "OpenRadiation", -1);
    else
    	db = openDatabase("Database", "1.0", "OpenRadiation", -1);
	callback(null,'initDb');
}

//CREATE TABLES

//error
function createTableError(tx, error, tableName) {
    console.log("Table "+tableName+" error : " + error.message);
}

function transactionError(tx, error) {
    console.log("transactionError: " + error.message);
}

//devices
function createTableDevices(callback)
{
	db.transaction(
			function(tx) 
			{
				tx.executeSql('CREATE TABLE IF NOT EXISTS "devices" ' +
						' ("id" INTEGER PRIMARY KEY AUTOINCREMENT , ' +
						'  "sensorUUID" VARCHAR,' +
						'  "sensorName" VARCHAR,' +
						'  "sensorVersion" VARCHAR,' +
						'  "sensorType" VARCHAR,' +
						'  "sensorTubeType" VARCHAR,' +
						'  "paramAudioHits" BOOLEAN not null default 1,' +
						'  "paramVisualHits" BOOLEAN not null default 1' +
						');',[],
						function(tx){},
						function(tx,error){createTableError(tx, error,"devices");});
			},
			function(tx,error){
				transactionError(tx, error);
				callback(true,'transaction createTableDevices Error')
			},
			function(tx){
				callback(null,'transaction createTableDevices Success')
			}
	);
}

//measures
function createTableMeasures(callback)
{
	db.transaction(
			function(tx) 
			{
				tx.executeSql('CREATE TABLE IF NOT EXISTS "measures" ' +
						' ("id" INTEGER PRIMARY KEY AUTOINCREMENT , ' +
						'  "sensorUUID" VARCHAR,' +
						'  "sensorName" VARCHAR,' +
						'  "sensorVersion" VARCHAR,' +
						'  "sensorType" VARCHAR,' +
						'  "sensorTubeType" VARCHAR,' +
						'  "reportUUID" VARCHAR,' +
						'  "deviceUUID" VARCHAR,' +
						'  "devicePlatform" VARCHAR,' +
						'  "deviceVersion" VARCHAR,' +
						'  "deviceModel" VARCHAR,' +
						'  "tsStart" TIMESTAMP,' +
						'  "tsEnd" TIMESTAMP,' +
						'  "duration" VARCHAR,' +
						'  "temperature" FLOAT,' +
						'  "nbHits" INTEGER,' +
						'  "radiation" FLOAT,' +
						'  "manualReporting" BOOLEAN DEFAULT FALSE,' +
						'  "longitude" VARCHAR,' +
						'  "latitude" VARCHAR,' +
						'  "accuracy" VARCHAR,' +
						'  "altitude" VARCHAR,' +
						'  "altitudeAccuracy" VARCHAR,' +
						'  "environment" VARCHAR,' +
						'  "position" INTEGER,' +
						'  "tags" TEXT,' +
						'  "notes" TEXT,' +
						'  "sent" BOOLEAN DEFAULT FALSE);',[],
						function(tx){},
						function(tx,error){createTableError(tx, error,"measures");});
			},
			function(tx,error){
				transactionError(tx, error);
				callback(true,'transaction createTableMeasures Error')
			},
			function(tx){
				callback(null,'transaction createTableMeasures Success')
			}
	);
}

//params
function createTableParams(callback)
{
	db.transaction(
			function(tx) 
			{
				tx.executeSql('CREATE TABLE IF NOT EXISTS "params" ' +
						' ("id" INTEGER PRIMARY KEY AUTOINCREMENT , ' +
						'  "paramName" VARCHAR,' +
						'  "active" BOOLEAN not null default 0,' +
						'  "libre" TEXT);',[],
						function(tx){},
						function(tx,error){createTableError(tx, error,"params");});
			},
			function(tx,error){
				transactionError(tx, error);
				callback(true,'transaction createTableParams Error')
			},
			function(tx){
				callback(null,'transaction createTableParams Success')
			}
	);
}


//REQUEST

//error
function requestTableError(tx, error, tableName) {
  console.log("Table "+tableName+" error : " + error.message);
}

//devices requests
function setConnectedDevice($scope)
{
	console.log('setConnectedDevice');
	db.transaction(
			function(tx) 
			{
				tx.executeSql('SELECT * FROM "devices" WHERE sensorUUID="'+ $scope.connectedDevice.uuid +'";',[],
						function(tx,res){
							if (res.rows.length > 0)
							{	
								//on récupère les infos				
								if ($scope.connectedDevice.name != res.rows.item(0).name)
								{
									//mise à jour du name si besoin
									tx.executeSql('UPDATE "devices" '+
											'SET sensorName = "'+ $scope.connectedDevice.name +'"'+
											'WHERE sensorUUID="'+$scope.connectedDevice.uuid+'";',[],
											function(tx){},
											function(tx,error){requestTableError(tx, error,"update devices");});
								}
								$scope.connectedDevice.version = res.rows.item(0).sensorVersion;
								$scope.connectedDevice.sensorType = res.rows.item(0).sensorType;
								$scope.connectedDevice.tubeType = res.rows.item(0).sensorTubeType;
								$scope.connectedDevice.audioHits = (res.rows.item(0).paramAudioHits?true:false);
								$scope.connectedDevice.visualHits = (res.rows.item(0).paramVisualHits?true:false);
								if (typeof rfduino != 'undefined')
								{
									setBluetoothDeviceParams(rfduino,$scope,'audioHits');
									setBluetoothDeviceParams(rfduino,$scope,'visualHits');
								}
								$scope.$apply();
							}
							else
							{
								//on enregistre
								tx.executeSql('INSERT INTO "devices" '+
										'(sensorUUID,sensorName) VALUES("'+
										
										$scope.connectedDevice.uuid+'","'+
										$scope.connectedDevice.name+'"' +

										');',[], 
										function(tx,results){
											$scope.connectedDevice.version = "";
											$scope.connectedDevice.sensorType = "";
											$scope.connectedDevice.tubeType = "";
											$scope.connectedDevice.audioHits = true;
											$scope.connectedDevice.visualHits = true;
											if (typeof rfduino != 'undefined')
											{
												setBluetoothDeviceParams(rfduino,$scope,'audioHits');
												setBluetoothDeviceParams(rfduino,$scope,'visualHits');
											}
											$scope.$apply();
										},
										function(tx,error){requestTableError(tx, error,"insert devices");});
								
							}
							//$scope.$apply();
							
						},
						function(tx,error){requestTableError(tx, error,"select devices");});
			},
			function(tx,error){
				transactionError(tx, error);
			},
			function(tx){
			}
	);
}

function setConnectedDeviceInfos($scope,type){
	db.transaction(
		function(tx) 
		{
			if (type == "version")
			{
				tx.executeSql('UPDATE "devices" '+
						'SET sensorVersion = "'+ $scope.connectedDevice.version +'"'+
						'WHERE sensorUUID="'+$scope.connectedDevice.uuid+'";',[],
						function(tx){},
						function(tx,error){requestTableError(tx, error,"update version infos devices");});
			}
			
			if (type == "sensorType")
			{
				tx.executeSql('UPDATE "devices" '+
						'SET sensorType = "'+ $scope.connectedDevice.sensorType +'"'+
						'WHERE sensorUUID="'+$scope.connectedDevice.uuid+'";',[],
						function(tx){},
						function(tx,error){requestTableError(tx, error,"update version infos devices");});
			}
			
			if (type == "tubeType")
			{
				tx.executeSql('UPDATE "devices" '+
						'SET sensorTubeType = "'+ $scope.connectedDevice.tubeType +'"'+
						'WHERE sensorUUID="'+$scope.connectedDevice.uuid+'";',[],
						function(tx){},
						function(tx,error){requestTableError(tx, error,"update version infos devices");});
			}
			
			if (type == "audioHits")
			{
				tx.executeSql('UPDATE "devices" '+
						'SET paramAudioHits = "'+  ($scope.connectedDevice.audioHits?1:0) +'"'+
						'WHERE sensorUUID="'+$scope.connectedDevice.uuid+'";',[],
						function(tx){},
						function(tx,error){requestTableError(tx, error,"update version infos devices");});
				if (typeof rfduino != 'undefined')
				{
					setBluetoothDeviceParams(rfduino,$scope,'audioHits');
				}
			}
			
			if (type == "visualHits")
			{
				tx.executeSql('UPDATE "devices" '+
						'SET paramVisualHits = "'+  ($scope.connectedDevice.visualHits?1:0) +'"'+
						'WHERE sensorUUID="'+$scope.connectedDevice.uuid+'";',[],
						function(tx){},
						function(tx,error){requestTableError(tx, error,"update version infos devices");});
				if (typeof rfduino != 'undefined')
				{
					setBluetoothDeviceParams(rfduino,$scope,'visualHits');
				}
					
			}
		}
	);
		
}

//measures requests
function insertMeasures($scope){
	
	console.log($scope);
	if (typeof $scope.mesure.total=="undefined" || $scope.mesure.total=="undefined" || $scope.mesure.total=="")
		$scope.mesure.total =-1000;
	if (typeof $scope.mesure.temperature=="undefined" || $scope.mesure.temperature=="undefined" || $scope.mesure.temperature=="")
		$scope.mesure.temperature =-1000;
	
	//new champ version
	var newversion = $scope.connectedDevice.name + $scope.connectedDevice.version + $scope.connectedDevice.serial;
	
	if (typeof device != "undefined")
	{
		//do nothing;
	}
	else
	{
		//emulation
		device = {};
		device.uuid = "mydeviceUUID";
		device.platform = "mydevicePlatform";
		device.version = "mydeviceVersion";
		device.model = "mydeviceModel";
	}
	db.transaction(function(tx) {
		tx.executeSql('INSERT INTO "measures" '+
				'(sensorUUID,sensorName,sensorVersion,sensorType,sensorTubeType,'+
				'reportUUID,'+
				'deviceUUID,devicePlatform,deviceVersion,deviceModel,' +
				'tsStart, tsEnd,duration, temperature, nbHits,radiation,manualReporting,' +
				'longitude,latitude,accuracy,altitude,altitudeAccuracy,' +
				'environment,position,tags,notes,sent) VALUES("'+
				
				$scope.connectedDevice.uuid+'","'+
				$scope.connectedDevice.name+'","'+
				//$scope.connectedDevice.version+'","'+
				newversion+'","'+
				$scope.connectedDevice.sensorType+'","'+
				$scope.connectedDevice.tubeType+'","'+
				
				generateUUID()+'","'+  //reportUUID
					
				device.uuid+'","'+
				device.platform+'","'+ 
				device.version+'","'+ 
				device.model+'","'+ 
				
				$scope.mesure.timedeb+'","'+
				($scope.mesure.timedeb + $scope.mesure.duration) +'","'+
				$scope.mesure.duration+'",'+
				$scope.mesure.temperature+','+
				$scope.mesure.total+','+
				parseFloat(String($scope.mesure.valeurnsv).replace(',', '.'))+','+
				$scope.mesure.manualreport+',"'+
				
				$scope.mesure.longitude+'","'+
				$scope.mesure.latitude+'","'+
				$scope.mesure.accuracy+'","'+
				$scope.mesure.altitude+'","'+
				$scope.mesure.altitudeaccuracy+'","'+
				
				$scope.mesure.env+'",'+
				$scope.mesure.position+',"'+
				$scope.mesure.tags+'","'+
				$scope.mesure.notes+'",'+
				'0);',[], 
				function(tx,results){
					var lastInsertId = results.insertId; 
					if ($scope.publi_auto)
						sendMeasures($scope,lastInsertId)
			
			
		},
				function(tx,error){requestTableError(tx, error,"insert measures");});
		},
		function(tx,error){
			transactionError(tx, error);
		},
		function(tx){
		}
	);
}


function getMeasures($scope){
	$scope.measures = [],
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM "measures" ORDER BY tsStart DESC;',[], 
				function(tx,res){
			console.log(res);
					if (res.rows.length > 0)
					{				
						for (var i = 0; i < res.rows.length; i++) {
							$scope.measures[i]=res.rows.item(i);
						}
					}
					console.log($scope.measures);
					$scope.$apply();
					
				},
				function(tx,error){requestTableError(tx, error,"insert measures");});
		},
		function(tx,error){
			transactionError(tx, error);
		},
		function(tx){
		}
	);
}

function sendMeasures($scope,measure){
	
	id = measure.id;
	args ={};
	args.apiKey = API_KEY;
	args.data = {};
	args.data.reportContext = "routine";
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM "measures" WHERE id='+id+';',[], 
				function(tx,res){
					console.log(res);
					if (res.rows.length > 0)
					{	
						
						
						mesure = res.rows.item(0);
						console.log(mesure)
						args.data.reportUuid = generateUUID(); //TODO: enregistrer dans table
						//infos capteur
						if (mesure.sensorUUID != '' && mesure.sensorUUID != 'undefined')
							args.data.apparatusId = mesure.sensorUUID;
						/*if (mesure.sensorName != '')
							args.data.apparatusVersion = mesure.sensorName;*/
						if (mesure.sensorVersion != '' && mesure.sensorVersion != 'undefined')
							args.data.apparatusVersion = mesure.sensorVersion;
						if (mesure.sensorType != '' && mesure.sensorType != 'undefined')
							//args.data.apparatusSensorType = mesure.sensorType;
							args.data.apparatusSensorType = "geiger";
						if (mesure.sensorTubeType != '' && mesure.sensorTubeType != 'undefined')
							args.data.apparatusTubeType = mesure.sensorTubeType;
						
						
						//GPS
						args.data.longitude = parseFloat(mesure.longitude);
						args.data.latitude = parseFloat(mesure.latitude);
						args.data.accuracy = parseFloat(mesure.accuracy);
						if (mesure.altitude != '' && mesure.altitude != 'null')
							args.data.altitude = parseInt(mesure.altitude);
						if (mesure.altitudeAccuracy != '' && mesure.altitudeAccuracy != 'null')
							args.data.altitudeAccuracy = parseFloat(mesure.altitudeAccuracy);
						
						//mesure
						if (mesure.nbHits != -1000)
							args.data.hitsNumber = parseInt(mesure.nbHits);
						args.data.value = mesure.radiation;
						args.data.startTime = convertTimestampToTimezone(mesure.tsStart);
						if (mesure.duration != "undefined")
							args.data.endTime = convertTimestampToTimezone(parseInt(mesure.tsStart)+parseInt(mesure.duration));
						args.data.manualReporting = (mesure.manualReporting?true:false);
						
						//device
						args.data.deviceUuid = mesure.deviceUUID;
						args.data.devicePlatform = mesure.devicePlatform;
						args.data.deviceVersion = mesure.deviceVersion;
						args.data.deviceModel = mesure.deviceModel;
						
						//temperature
						if (mesure.temperature != -1000)
						{
							args.data.temperature = parseInt(mesure.temperature);
							//alert(args.data.temperature);
						}
						
						//compléments mesure
						if (mesure.environment != '')
							args.data.measurementEnvironment = mesure.environment;
						if (mesure.position != -1)
							args.data.measurementHeight = mesure.position;
						
						if ((typeof $scope.connexion !== 'undefined') && (typeof $scope.connexion.connexion !== 'undefined') && ($scope.connexion.connexion))	
						{
							//User
							args.data.userId = $scope.connexion.login;
							args.data.userPwd = $scope.connexion.mdp;
							
							//compléments mesure
							if (mesure.notes != '')
								args.data.description = mesure.notes;
							if (mesure.tags != '')
								args.data.tags = mesure.tags.split(/[\s,]+/).slice(0,10);
						}

						xhr_object = new XMLHttpRequest(); 
						uri= API_URI; 
						xhr_object.open("POST", uri, true);
						xhr_object.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
						
						xhr_object.onreadystatechange = function() { 
							if(xhr_object.readyState == 4) {
								status = parseInt(xhr_object.status);
								if ((status>=200) && (status < 300))
								{
									console.log(xhr_object.responseText);
									if (xhr_object.responseText == "")
									{
										db.transaction(function(tx) {
											tx.executeSql('UPDATE "measures" SET sent = 1 WHERE id='+id+';',[], function(tx,res){
												alertNotif('Données envoyées','Historique','Ok');
												getMeasures($scope);
												
												
											},
											function(tx,error){requestTableError(tx, error,"update measures");});
										},
										function(tx,error){
											transactionError(tx, error);
										},
										function(tx){
										});
										measure.encours = false;
										$scope.$apply();
									}
									else
									//error	
									{ 
										if (xhr_object.responseText != "")
										{
											aError = JSON.parse(xhr_object.responseText);
											alertNotif("Erreur d'envoi =\n"+aError.error.code+' : '+aError.error.message,'Envoi Mesure','Ok');
										}
										else
											alertNotif("Erreur d'envoi =\n"+xhr_object.status,'Envoi Mesure','Ok');
										measure.encours = false;
										$scope.$apply();
									}
								}
								else
								//error
								{
									if (xhr_object.responseText != "")
									{
										aError = JSON.parse(xhr_object.responseText);
										alertNotif("Erreur d'envoi =\n"+aError.error.code+' : '+aError.error.message,'Envoi Mesure','Ok');
									}
									else
										alertNotif("Erreur d'envoi =\n"+xhr_object.status,'Envoi Mesure','Ok');
									measure.encours = false;
									$scope.$apply();
								}
								
							}
							return xhr_object.readyState;
						}
						
						//  Envoi de la requête
						console.log("ARGS");
						console.log(JSON.stringify(args));
						xhr_object.send(JSON.stringify(args));
					}					
				},
				function(tx,error){requestTableError(tx, error,"insert measures");});
		},
		function(tx,error){
			transactionError(tx, error);
		},
		function(tx){
		}
	);
}

function deleteMeasures($scope,id){
	db.transaction(function(tx) {
		tx.executeSql('DELETE FROM "measures" WHERE id='+id+';',[], 
				function(tx,res){
					getMeasures($scope);
					$scope.$apply();
				},
				function(tx,error){requestTableError(tx, error,"delete measures");});
		},
		function(tx,error){
			transactionError(tx, error);
		},
		function(tx){
		}
		);
		

}

//params requests
function saveParam(paramName,active,text)
{
	db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM "params" WHERE paramName="'+paramName+'";',[], 
			function(tx,res){
					if (res.rows.length > 0)
					//UPDATE
					{				
						tx.executeSql('UPDATE "params" '+
								'SET active = '+active+', libre = "'+text+'"'+
								'WHERE paramName="'+paramName+'";',[], 
								function(tx){},
								function(tx,error){requestTableError(tx, error,"update params");});
					}
					else
					//INSERT
					{
						tx.executeSql('INSERT INTO "params" '+
								'(paramName, active, libre) VALUES("'+
								paramName+'",'+
								active+',"'+
								text+'");',[], 
								function(tx){},
								function(tx,error){requestTableError(tx, error,"insert params");});
						
					}
					
				},
				function(tx,error){requestTableError(tx, error,"select params");});
		},
		function(tx,error){
			transactionError(tx, error);
		},
		function(tx){
		}
	);
	
}

function getParam($scope,paramName)
{
	if (typeof paramName == 'undefined')
		where = ";";
	else
		where = 'WHERE paramName="'+paramName+'";'
		db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM "params" '+where,[], 
				function(tx,res){
						if (res.rows.length > 0)
							for (var i = 0; i < res.rows.length; i++) {
								switch(res.rows.item(i).paramName) {
								    case 'expert_mode':
								        $scope.expert_mode = (res.rows.item(i).active?true:false);
								        break;
								    case 'publi_auto':
								        $scope.publi_auto = (res.rows.item(i).active?true:false);
								        break;   
								    case 'connexion':
								    	if (typeof $scope.connexion  === 'undefined')
								    		$scope.connexion = {};
								        $scope.connexion.connexion = (res.rows.item(i).active?true:false);
								        break;
								    case 'login':
								    	if (typeof $scope.connexion  === 'undefined')
								    		$scope.connexion = {};
								        $scope.connexion.login = res.rows.item(i).libre;
								        break;
								    case 'mdp':
								    	if (typeof $scope.connexion  === 'undefined')
								    		$scope.connexion = {};
								        $scope.connexion.mdp = res.rows.item(i).libre;
								        break;
								   /* case n:
								        code block
								        break;*/
								    default:
								        break;
								}
							}
							$scope.$apply();
					},
					function(tx,error){requestTableError(tx, error,"select params");});
			},
			function(tx,error){
				transactionError(tx, error);
			},
			function(tx){
			}
		);
		
}

//user function
function testUser($scope,$location,$rootScope){
	args ={};
	args.apiKey = API_KEY;
	args.data = {};
	args.data.latitude = 48.23456;
	args.data.longitude = 2.657723;
	args.data.value = 0.065;
	args.data.reportUuid = "110e8422-e29b-11d4-a716-446655440001";
	args.data.startTime = "2016-05-23T08:49:59.000Z";
	args.data.userId = $scope.login;
	args.data.userPwd = $scope.mdp;
	args.data.reportContext = "test";

	xhr_object = new XMLHttpRequest();
	uri= API_URI;
	xhr_object.open("POST",uri, true);
	xhr_object.setRequestHeader("Content-Type","application/json;charset=UTF-8");
	
	xhr_object.onreadystatechange = function() { 
		if(xhr_object.readyState == 4) {
			status = parseInt(xhr_object.status);
			if ((status>=200) && (status < 300))
			{
				rep = JSON.parse(xhr_object.responseText);
				console.log(rep);
				if (rep.test)
				{
					saveParam('connexion',1,'');
					saveParam('login',1,$scope.login);
					saveParam('mdp',1,$scope.mdp);
					$scope.connexion = {};
					$scope.connexion.connexion = true;
					$scope.connexion.login = $scope.login;
					$scope.connexion.mdp = $scope.mdp;
					$scope.login = '';
					$scope.mdp = '';
					$location.path('/param');
					$rootScope.loading = false;
					$scope.$apply();
				}
				else
				//error	
				{
					$rootScope.loading = false;
					$scope.$apply();
					if (xhr_object.responseText != "")
					{
						aError = JSON.parse(xhr_object.responseText);
						alertNotif("Erreur d'envoi =\n"+aError.error.code+' : '+aError.error.message,'Authentification','Ok');
					}
					else
						alertNotif("Erreur d'envoi =\n"+xhr_object.status,'Authentification','Ok');
					
				}
			
			}
	  		else
  			 //error
  			 {
	  			$rootScope.loading = false;
	  			$scope.$apply();
	  			if (xhr_object.responseText != "")
				{
					aError = JSON.parse(xhr_object.responseText);
					alertNotif("Erreur d'envoi =\n"+aError.error.code+' : '+aError.error.message,'Authentification','Ok');
				}
				else
					alertNotif("Erreur d'envoi =\n"+xhr_object.status,'Authentification','Ok');
  			 }
	  	 }
	  	 return xhr_object.readyState;
	}
	
	//  Envoi de la requête
	console.log("ARGS");
	console.log(JSON.stringify(args));
	xhr_object.send(JSON.stringify(args));
}

/////////////////////////////////////////////////////////////////////
//Functions RFDUINO
/////////////////////////////////////////////////////////////////////
function doBluetoothDeviceSearch($scope)
{
    //TODO : do scan until find a known one
    rfduino.discover(5, function(deviceSensor) {
    	$scope.devices[deviceSensor.uuid] = deviceSensor;
    	$scope.$apply();
	}, function(){alert('pb');} );
}

function doAskBluetoothDeviceInfos(rfduino,$scope)
{
	var data = new Uint8Array(1);
	data[0]=IN_PACKET_SEND_INFO;
	
	rfduino.write(data.buffer,function() {
		//success
		},
	    function() {alertNotif($scope.connectedDevice.uuid+" failure send info","Failure","Ok")}
	);
}

function setBluetoothDeviceParams(rfduino,$scope,type)
{
	var data = new Uint8Array(2);
	if (type == "audioHits")
	{
		data[0]=IN_PACKET_SILENT;
		data[1]=0x00;
		if($scope.connectedDevice.audioHits==false)
			data[1]=0x01;
		rfduino.write(data.buffer,function() {
			//success
			},
		    function() {alertNotif($scope.connectedDevice.uuid+" failure send param silent","Failure","Ok")}
		);
	}
	if (type == "visualHits")
	{
		data[0]=IN_PACKET_STEALTH;
		data[1]=0x00;
		if($scope.connectedDevice.visualHits==false)data[1]=0x01;
		rfduino.write(data.buffer,function() {
			//success
			},
		    function() {alertNotif($scope.connectedDevice.uuid+" failure send param silent","Failure","Ok")}
		);
	}
}

function doOnData(rfduino,$scope)
{
	rfduino.onData(function(data){
			var myData = getData(data);
			
			/*$scope.dataDebug[convertIdDebug($scope.iData)] = myData;
			$scope.iData++;*/
			
			var mytimestampmill = new Date().getTime();
			for (var key in myData) {
				if (myData.hasOwnProperty(key)) {
					
					//serial number
					if (key == "1")
					{
						$scope.connectedDevice.serial = myData[key].data;
						//setConnectedDeviceInfos($scope,'serial');
						$scope.$apply();
					}
					
					//version
					if (key == "2")
					{
						$scope.connectedDevice.version = myData[key].data;
						setConnectedDeviceInfos($scope,'version');
						$scope.$apply();
					}
					
					//sensor_type
					if (key == "3")
					{
						$scope.connectedDevice.sensorType = myData[key].data;
						setConnectedDeviceInfos($scope,'sensorType');
						$scope.$apply();
					}
					
					//count
					if (key == "5" && ($scope.mesure.encours || $scope.mesure.init))
					{
						if ($scope.mesure.encours)
						{
							var mytimestamp = parseInt(new Date().getTime()/1000);
							var duration = mytimestamp - $scope.mesure.timedeb
							$scope.mesure.duration = duration;
							$scope.mesure.total += myData[key].data;
							$scope.mesure.moymin = ($scope.mesure.total / duration * 60).toFixed(2);
							$scope.mesure.valeurnsv = convertNanosievert($scope.mesure.total,duration);
						}
						if (typeof $scope.mesure.log[mytimestampmill] === 'undefined')
						{
							$scope.mesure.log[mytimestampmill] = {};
							$scope.mesure.log[mytimestampmill].timestamp = mytimestampmill;
						}
						$scope.mesure.log[mytimestampmill].coup = myData[key].data;
						
						$scope.$apply();
						doProgressBar($scope.mesure.total);
						//i++;
					}
					
					//temperature
					if (key == "6" && ($scope.mesure.encours || $scope.mesure.init))
					{
						if ($scope.mesure.encours)
							$scope.mesure.temperature = myData[key].data;
						if (typeof $scope.mesure.log[mytimestampmill] === 'undefined')
						{
							$scope.mesure.log[mytimestampmill] = {};
							$scope.mesure.log[mytimestampmill].timestamp = mytimestampmill;
						}
						$scope.mesure.log[mytimestampmill].temperature = myData[key].data;
						$scope.$apply();
					}
					
					//tube_type
					if (key == "16")
					{
						$scope.connectedDevice.tubeType = myData[key].data;
						setConnectedDeviceInfos($scope,'tubeType');
						$scope.$apply();
					}
					
					//tension
					if (key == "18")
					{
						//$scope.mesure.tension = (myData[key].data).toFixed(2);
						if ($scope.mesure.encours || $scope.mesure.init)
						{
							if (typeof $scope.mesure.log[mytimestampmill] === 'undefined')
							{
								$scope.mesure.log[mytimestampmill] = {};
								$scope.mesure.log[mytimestampmill].timestamp = mytimestampmill;
							}
							$scope.mesure.log[mytimestampmill].tension = (myData[key].data).toFixed(2);
						}
						
						
						if (!$scope.mesure.encours && $scope.mesure.init == true && (myData[key].data > tensions_tube[$scope.connectedDevice.tubeType]["tension_min"]))
						{
							$scope.mesure.timedeb = parseInt(new Date().getTime()/1000);
							$scope.mesure.init =false;
							$scope.mesure.encours = true;
						}
					}
				}
			}
	},
	function(error){alertNotif($scope.connectedDevice.uuid+" onData error : "+error,"Failure","Ok")});
}

function getData(data) {
    var offset = 0;
    var datatype = 0;
    var stringlen = 0;
    var buff = new Uint8Array(data);
    var dataView = new DataView(data);
    var hex = [];
    
    for (var i=offset ; i<offset+buff.length ; i++) {
            hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
        }
    myData = {}
	
    while (offset < buff.length) {
	datatype = dataView.getUint8(offset);
	offset++;
	switch (datatype) {
        case OUT_PACKET_COUNT:
	    case OUT_PACKET_DEBUG_BYTE1:
	    case OUT_PACKET_DEBUG_BYTE2: 
	        	myData[datatype] ={};
	        	myData[datatype]['data'] = dataView.getUint8(offset);
	        	offset++;
	        	break;
        case 0xA2: 
                horizon.pitch = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            
	    case OUT_PACKET_ACTUAL_TENSION :
	    case OUT_PACKET_PWM_DUTY_CYCLE : 
	    case OUT_PACKET_TEMPERATURE :
                tension_courante = dataView.getFloat32(offset, true);
                myData[datatype] ={};
                myData[datatype]['data'] = tension_courante;
                offset += 4;
                break;
            
	    case OUT_PACKET_SENSOR_TYPE :
	    case OUT_PACKET_TUBE_TYPE :
	    case OUT_PACKET_VERSION : 
	    case OUT_PACKET_SERIAL_NB : 
                stringlen = dataView.getUint8(offset);
				offset++;
				myData[datatype] ={};
		        	myData[datatype]['data'] = '';
				
				for (var i=offset ; i<offset+stringlen ; i++) {
					myData[datatype]['data'] +=  String.fromCharCode(buff[i]);
					 }
		
				offset += stringlen;
                break;
            
	    
            default:
		offset++;
	    break;
        }
    }
    //myData[type]['lng'] = buff.length;
    myData['hex']={};
    myData['hex']['hex'] =hex.join(" ").toUpperCase();
    return myData;
}

/////////////////////////////////////////////////////////////////////
//Functions FAKE
/////////////////////////////////////////////////////////////////////
function fakeBluetoothDeviceSearch($scope)
{
	$scope.devices = {};
	$scope.devices['0'] = {'name':'device 0','uuid':'deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0'};
	$scope.devices['1'] = {'name':'device 1','uuid':'deviceid1'};
	
}

function fakeBluetoothDeviceInfos($scope)
{
	$scope.connectedDevice.version =  "Test Sensor Version";
	setConnectedDeviceInfos($scope,'version');
	$scope.connectedDevice.sensorType  =  "geiger";
	setConnectedDeviceInfos($scope,'sensorType');
	$scope.connectedDevice.tubeType  =  "Test Sensor Tube Type";
	setConnectedDeviceInfos($scope,'tubeType');
	$scope.connectedDevice.serial  =  "Test Sensor Serial";
}

function fakeSearch($scope){
	$scope.state = "2";
	setTimeout(function (){$scope.state = "3";console.log("state3");$scope.$apply();}, 5000);
	setTimeout(function (){$scope.state = "4";console.log("state4");$scope.$apply();}, 6000);
}
function fakeMesure($scope,i){
	if ($scope.mesure.encours)
	{
		var mytimestampmill = new Date().getTime();
		var mytimestamp = parseInt(new Date().getTime()/1000);
		var duration = mytimestamp - $scope.mesure.timedeb
		var nbcoup = Math.floor(Math.random()*2);
		console.log('coups'+nbcoup);
		$scope.mesure.duration = duration;
		$scope.mesure.total += nbcoup;
		$scope.mesure.moymin = ($scope.mesure.total / duration * 60).toFixed(2);
		$scope.mesure.valeurnsv = convertNanosievert($scope.mesure.total,duration);
		$scope.mesure.log[mytimestampmill] = {}
		$scope.mesure.log[mytimestampmill].timestamp = mytimestampmill;
		$scope.mesure.log[mytimestampmill].coup = nbcoup;
		$scope.mesure.log[mytimestampmill].temperature = parseInt((Math.random() *10) +50);
		$scope.mesure.log[mytimestampmill].tension =parseInt((Math.random() *10) +300);
		$scope.$apply();
		
		doProgressBar($scope.mesure.total);
		setTimeout(function (){fakeMesure($scope,i)},1000);
	}
	else if ($scope.mesure.encours == false && $scope.mesure.init == true)
	{
		if (i==10)
		{
			$scope.mesure.timedeb = parseInt(new Date().getTime()/1000);
			$scope.mesure.encours = true;
			$scope.mesure.init =false;
		}	
		else
			i++;
		$scope.$apply();
		setTimeout(function (){fakeMesure($scope,i)},1000);
	}
}

function doProgressBar(mycount){
	var max = 30;
	var percent = mycount*100/max;
	if (percent<100)
		$('.mesure .blocMesure1 .fiability .progressbar2').width( percent+'%');
	else 
		$('.mesure .blocMesure1 .fiability .progressbar2').width('100%');
	if (percent>50)
		$('.mesure .blocMesure1 .fiability .progressbar2').css("background-color","#dfe700");
	if (percent>100)
		$('.mesure .blocMesure1 .fiability .progressbar2').css("background-color","#aee700");
}

/////////////////////////////////////////////////////////////////////
//Functions Alerte/Notif
/////////////////////////////////////////////////////////////////////

//Function affichage debug
function alertNotif(message,titre,buttonText)
{
		if (isMobile)
		navigator.notification.alert(
				message,  			// message
			    function(){},       // callback
			    titre,            	// title
			    buttonText          // buttonName
			);
		else
			alert(titre+"\n\n"+message);
}


//Function affichage debug
function alertDebug(message)
{
	if (debug)
		if (isMobile)
		navigator.notification.alert(
				message,  			// message
			    function(){},       // callback
			    'Debug',            // title
			    'Ok'                // buttonName
			);
		else
			alert(message);
}

/////////////////////////////////////////////////////////////////////
//Functions UTILS
/////////////////////////////////////////////////////////////////////

//UUID
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

function getGPS($scope) {
	console.log('getGPS');
	if (typeof navigator.geolocation != 'undefined')
	{
		if (typeof $scope.gpslatitude !== 'undefined' && $scope.gpslatitude != 0) {
				$scope.mesure.latitude = $scope.gpslatitude;
				$scope.mesure.longitude = $scope.gpslongitude;
			}
		navigator.geolocation.getCurrentPosition(
			function (position){
				$scope.mesure.latitude = (position.coords.latitude).toFixed(7);;
				$scope.mesure.longitude = (position.coords.longitude).toFixed(7);;
				$scope.mesure.accuracy = position.coords.accuracy;
				$scope.mesure.altitude = position.coords.altitude;
				$scope.mesure.altitudeaccuracy = position.coords.altitudeAccuracy;
				if (position.coords.accuracy > ACCURACY_GPS)
					$scope.gps = "bad";
				else
					$scope.gps = "good";
				console.log("accuracy "+position.coords.accuracy);
			$scope.$apply();
		},function (error) {
			$scope.gps = 'error';
			$scope.$apply();
			/*PositionError.PERMISSION_DENIED = 1;
			PositionError.POSITION_UNAVAILABLE = 2;
			PositionError.TIMEOUT = 3;*/
			if (error.code == 1)
				alertNotif("L'application ne peut accéder à la localisation. Veuillez lui en donner l'autorisation","Erreur localisation",'Ok');
			if (error.code == 2)
				alertNotif("La localisation ne semble pas activée. Veuillez l'activer.","Erreur localisation",'Ok');
			if (error.code == 2)
				alertNotif("La localisation n'est pas disponible.","Erreur localisation",'Ok');
	      },
	      { enableHighAccuracy: true });
	}
}

function testGPS($scope,alert) {
	console.log('gps');
	if (typeof navigator.geolocation != 'undefined')
		navigator.geolocation.getCurrentPosition(function (position){
			/*$scope.gps = {};*/
			$scope.gpslatitude = (position.coords.latitude).toFixed(7);;
			$scope.gpslongitude = (position.coords.longitude).toFixed(7);;
			if (position.coords.accuracy > ACCURACY_GPS)
				$scope.gps = "bad";
			else
				$scope.gps = "good";
			console.log("accuracy "+position.coords.accuracy);
			$scope.$apply();

		},function (error) {
			$scope.gps = 'error';
			$scope.$apply();
			/*PositionError.PERMISSION_DENIED = 1;
			PositionError.POSITION_UNAVAILABLE = 2;
			PositionError.TIMEOUT = 3;*/
			if (alert)
				if (error.code == 1)
					alertNotif("L'application ne peut accéder à la localisation. Veuillez lui en donner l'autorisation","Erreur localisation",'Ok');
				if (error.code == 2)
					alertNotif("La localisation ne semble pas activée. Veuillez l'activer.","Erreur localisation",'Ok');
				if (error.code == 2)
					alertNotif("La localisation n'est pas disponible.","Erreur localisation",'Ok');
	      },
	      { enableHighAccuracy: true });
}

function refreshGPS($scope,alert){
	testGPS($scope,alert);
	setTimeout(function(){refreshGPS($scope,false); }, 120000); //2min
}




//Conversions
function convertNanosievert(nbCoup,duration)
{
	//valueNSV = (nbCoup * 0.9) / (duration * 60) ;
	valueNSV = (nbCoup /duration) * 60 * 35 /10000;
	return valueNSV.toFixed(3);
}

function convertTimestampToTimezone(ts)
{
	date = new Date(ts*1000);	
	return date.getUTCFullYear()+"-"+convertWithZero(date.getUTCMonth()+1)+"-"+convertWithZero(date.getUTCDate())+"T"+convertWithZero(date.getUTCHours())+":"+convertWithZero(date.getUTCMinutes())+":"+convertWithZero(date.getUTCSeconds())+"Z";
}

function convertTimestampToDate(ts)
{
	date = new Date(ts*1000);	
	return convertWithZero(date.getDate())+"/"+convertWithZero(date.getMonth()+1)+"/"+date.getFullYear();
	//return convertWithZero(date.getDate())+"/"+convertWithZero(date.getMonth()+1)+"/"+date.getFullYear();
}

function convertTimestampToTime(ts)
{
	date = new Date(ts*1000);	
	return date.getHours()+":"+convertWithZero(date.getMinutes())+":"+convertWithZero(date.getSeconds());
}


function convertDurationForDisplay(duration)
{
	var timeToDisplay = "";
	seconde= duration%60;
	timeToDisplay = convertWithZero(seconde)+'"';
	if ((duration-seconde) > 0)
	{
		//minute = (duration-seconde)%3600;
		minute = ((duration-seconde)/60)%60;
		timeToDisplay = convertWithZero(minute)+"'"+timeToDisplay;
		if ((duration-seconde-(minute*60)) > 0)
		{
			hour = (duration-seconde-(minute*60))/3600;
			timeToDisplay = hour+"h"+timeToDisplay;
		}
	}
	
	
	return timeToDisplay;
}


function convertWithZero(m)
{
 return ('0' + (parseInt(m))).slice(-2);
}

function convertIdDebug(m)
{
 return ('000000000' + (parseInt(m))).slice(-9);
}

//raz
function resetMesureForm($scope){
	$scope.modelDuration = "";
	$scope.modelRadiation = "";
	$scope.modelTotal = "";
	$scope.modelTemperature = "";
	$scope.modelEnv = "";
	$scope.modelPos = -1;
	$scope.modelTags = "";
	$scope.modelDesc = "";
}

function sleep(seconds){
    var waitUntil = new Date().getTime() + seconds*1000;
    while(new Date().getTime() < waitUntil) true;
}

