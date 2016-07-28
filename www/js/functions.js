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
						'  "deviceId" VARCHAR,' +
						'  "deviceName" VARCHAR,' +
						'  "deviceType" VARCHAR);',[],
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
						'  "deviceId" VARCHAR,' +
						'  "tsStart" TIMESTAMP,' +
						'  "tsEnd" TIMESTAMP,' +
						'  "duration" VARCHAR,' +
						'  "temperature" FLOAT,' +
						'  "nbHits" INTEGER,' +
						'  "radiation" FLOAT,' +
						'  "gpsStatus" VARCHAR,' +
						'  "longitude" VARCHAR,' +
						'  "latitude" VARCHAR,' +
						'  "environment" INTEGER,' +
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


function insertMeasures($scope,res,device){
	db.transaction(function(tx) {
		tx.executeSql('INSERT INTO "measures" '+
				'(deviceId, tsStart, tsEnd,duration, temperature, nbHits,radiation, gpsStatus,longitude,latitude,environment,position,tags,notes,sent) VALUES("'+
				device.uuid+'","'+
				res.timedeb+'","'+
				(res.timedeb + res.duration) +'","'+
				res.duration+'",'+
				res.temperature+','+
				res.total+','+
				res.valeurnsv+',"'+
				res.gps+'","'+
				res.longitude+'","'+
				res.latitude+'",'+
				res.env+','+
				res.position+',"'+
				res.tags+'","'+
				res.notes+'",'+
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
		tx.executeSql('SELECT * FROM "measures";',[], 
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

function sendMeasures($scope,id){
	
	args ={};
	args.apiKey = "50adef3bdec466edc25f40c8fedccbce";
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
						args.data.longitude = parseInt(mesure.longitude);
						args.data.latitude = parseInt(mesure.latitude);
						args.data.value = mesure.radiation;
						args.data.startTime = convertTimestampToTimezone(mesure.tsStart);
						args.data.endTime = convertTimestampToTimezone(parseInt(mesure.tsStart)+parseInt(mesure.duration));
						
						if (mesure.temperature != -1000)
							args.data.temperature = mesure.temperature;
						
						if ((typeof $scope.connexion !== 'undefined') && (typeof $scope.connexion.connexion !== 'undefined') && ($scope.connexion.connexion))	
						{
							args.data.userId = $scope.connexion.login;
							args.data.userPwd = $scope.connexion.mdp;
							args.data.description = mesure.notes;
						}

						xhr_object = new XMLHttpRequest(); 
						uri="https://submit.open-radiation.net/measurements"; 
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
												$scope.$apply();
												
											},
											function(tx,error){requestTableError(tx, error,"update measures");});
										},
										function(tx,error){
											transactionError(tx, error);
										},
										function(tx){
										});
									}
									else
									//error	
									{
										alertNotif("Erreur d'envoi =\n"+xhr_object.responseText,'Historique','Ok');
									}
								}
								else
								//error
								{
									alertNotif("Erreur d'envoi =\n"+xhr_object.status,'Historique','Ok');
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

function testUser($scope,$location){
	args ={};
	args.apiKey = "50adef3bdec466edc25f40c8fedccbce";
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
	uri="https://submit.open-radiation.net/measurements";
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
					$scope.$apply();
				}
				else
				//error	
				{
					alertNotif("Erreur =\n"+xhr_object.responseText,'Authentification','Ok');
				}
			
			}
	  		else
  			 //error
  			 {
  			 	alertNotif("Erreur d'envoi =\n"+xhr_object.status,'Historique','Ok');
  			 }
	  	 }
	  	 return xhr_object.readyState;
	}
	
	//  Envoi de la requête
	console.log("ARGS");
	console.log(JSON.stringify(args));
	xhr_object.send(JSON.stringify(args));
}




testi = 0;
function test(callback,value){
//var test = function(tx,value){
	testi = testi + 1;
	console.log(testi);
	console.log(value);
	console.log("fin?");
	callback(null, 'test');
}




/////////////////////////////////////////////////////////////////////
//Functions RFDUINO
/////////////////////////////////////////////////////////////////////
function doBluetoothDeviceSearch($scope)
{
	console.log("Bluetooth is enabled");
    alert("Bluetooth is enabled");
   // $scope.devices = {};
    //TODO : do scan until find a known one
    rfduino.discover(5, function(device) {
	    //console.log(JSON.stringify(device));
		//alert(JSON.stringify(device));
    	$scope.devices[device.id] = device;
    	$scope.$apply();
	}, function(){alert('pb');} );
}

/////////////////////////////////////////////////////////////////////
//Functions Fake
/////////////////////////////////////////////////////////////////////
function fakeBluetoothDeviceSearch($scope)
{
	$scope.devices = {};
	$scope.devices['0'] = {'name':'device 0','uuid':'deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0deviceid0'};
	$scope.devices['1'] = {'name':'device 1','uuid':'deviceid1'};
	
}

function fakeSearch($scope){
	$scope.state = "2";
	setTimeout(function (){$scope.state = "3";console.log("state3");$scope.$apply();}, 5000);
	setTimeout(function (){$scope.state = "4";console.log("state4");$scope.$apply();}, 6000);
}
function fakeMesure($scope){
	if ($scope.mesure.encours)
	{
		var mytimestamp = parseInt(new Date().getTime()/1000);
		var duration = mytimestamp - $scope.mesure.timedeb
		var nbcoup = Math.floor(Math.random()*2);
		$scope.mesure.duration = duration;
		$scope.mesure.total += nbcoup;
		$scope.mesure.moymin = ($scope.mesure.total / duration * 60).toFixed(2);
		$scope.mesure.valeurnsv = convertNanosievert($scope.mesure.total,duration);
		$scope.mesure.log[mytimestamp] = {}
		$scope.mesure.log[mytimestamp].timestamp = mytimestamp;
		$scope.mesure.log[mytimestamp].coup = nbcoup;
		$scope.$apply();
		
		doProgressBar($scope.mesure.total);
		setTimeout(function (){fakeMesure($scope)},1000);
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

///
function ArrayBufferToString(buffer) {
    return BinaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer))));
}

function StringToArrayBuffer(string) {
    return StringToUint8Array(string).buffer;
}

function BinaryToString(binary) {
    var error;

    try {
        return decodeURIComponent(escape(binary));
    } catch (_error) {
        error = _error;
        if (error instanceof URIError) {
            return binary;
        } else {
            throw error;
        }
    }
}

function StringToBinary(string) {
    var chars, code, i, isUCS2, len, _i;

    len = string.length;
    chars = [];
    isUCS2 = false;
    for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
        code = String.prototype.charCodeAt.call(string, i);
        if (code > 255) {
            isUCS2 = true;
            chars = null;
            break;
        } else {
            chars.push(code);
        }
    }
    if (isUCS2 === true) {
        return unescape(encodeURIComponent(string));
    } else {
        return String.fromCharCode.apply(null, Array.prototype.slice.apply(chars));
    }
}

function StringToUint8Array(string) {
    var binary, binLen, buffer, chars, i, _i;
    binary = StringToBinary(string);
    binLen = binary.length;
    buffer = new ArrayBuffer(binLen);
    chars  = new Uint8Array(buffer);
    for (i = _i = 0; 0 <= binLen ? _i < binLen : _i > binLen; i = 0 <= binLen ? ++_i : --_i) {
        chars[i] = String.prototype.charCodeAt.call(binary, i);
    }
    return chars;
}

/*var onData = function(arrayBuffer) {
    var a = new Float32Array(arrayBuffer);
    celsius = a[0];
    fahrenheit = celsius * 1.8 + 32;
  }*/

var arrayBufferToFloat = function (ab) {
    var a = new Float32Array(ab);
    return a[0];
};

function getData(data) {
    var offset = 0;
    var datatype = 0;
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
            case 0xA2: // Pitch 
                horizon.pitch = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            
	    case OUT_PACKET_ACTUAL_TENSION : // Pitch 
                tension_courante = dataView.getFloat32(offset, true);
                myData[datatype] ={};
        	myData[datatype]['data'] = tension_courante;
		offset += 4;
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

function getDataTest(data) {
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
                tension_courante = dataView.getFloat32(offset, true);
                myData[datatype] ={};
        	myData[datatype]['data'] = tension_courante;
		offset += 4;
                break;
            
	    case OUT_PACKET_SENSOR_TYPE :
	    case OUT_PACKET_TUBE_TYPE :
	    case OUT_PACKET_VERSION : 
                stringlen = dataView.getUint8(offset);
		offset++;
		myData[datatype] ={};
        	myData[datatype]['data'] = '';
		
		for (var i=offset ; i<offset+stringlen ; i++) {
			myData[datatype]['data'] +=  buff[i];
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

function convertNanosievert(nbCoup,duration)
{
	valueNSV = (nbCoup * 0.9) / (duration * 60) ;
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
	return convertWithZero(date.getUTCDate())+"/"+convertWithZero(date.getUTCMonth()+1)+"/"+date.getUTCFullYear();
	//return convertWithZero(date.getDate())+"/"+convertWithZero(date.getMonth()+1)+"/"+date.getFullYear();
}

function convertTimestampToTime(ts)
{
	date = new Date(ts*1000);	
	return date.getUTCHours()+":"+date.getUTCMinutes()+":"+date.getUTCSeconds();
}


function convertDurationForDisplay(duration)
{
	var timeToDisplay = "";
	seconde= duration%60;
	timeToDisplay = seconde+'"';
	if ((duration-seconde) > 0)
	{
		minute = (duration-seconde)%3600;
		timeToDisplay = minute+"'"+timeToDisplay;
		if ((duration-seconde-minute) > 0)
		{
			hour = duration-seconde-minute;
			timeToDisplay = hour+"h"+timeToDisplay;
		}
	}
	
	
	return timeToDisplay;
}


function convertWithZero(m)
{
 return ('0' + (parseInt(m))).slice(-2);
}

function resetMesureForm($scope){
	$scope.modelDuration = "";
	$scope.modelRadiation = "";
	$scope.modelTotal = "";
	$scope.modelTemperature = "";
	$scope.modelEnv = 0;
	$scope.modelPos = 0;
	$scope.modelTags = "";
	$scope.modelDesc = "";
}

