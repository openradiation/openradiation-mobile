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
						'  "notes" TEXT);',[],
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


function createTableHoraires(callback)
{
	db.transaction(function(tx) 
	{  		
		//tx.executeSql('DROP TABLE IF EXISTS "horaires"');
		tx.executeSql('CREATE TABLE IF NOT EXISTS "horaires" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "uidquestionnaire" VARCHAR, "tsdebut" INTEGER, "dureevalidite" INTEGER, "notification" INTEGER, "fait" INTEGER);');                                          
	},function(tx){callback(true,'createHorairesError')},function(tx){callback(null,'createHorairesSuccess')});
}

function createTableReponses(callback)
{
	db.transaction(function(tx) 
	{  		
		//tx.executeSql('DROP TABLE IF EXISTS "reponses"');
		tx.executeSql('CREATE TABLE IF NOT EXISTS "reponses" ("id" INTEGER PRIMARY KEY AUTOINCREMENT , "idhoraire" INTEGER DEFAULT (0), "sid" VARCHAR, "gid" VARCHAR, "qid" VARCHAR, "reponse" VARCHAR, "tsreponse" INTEGER, "envoi" BOOLEAN not null default 0);');
	},function(tx){callback(true,'createReponsesError')},function(tx){callback(null,'createReponsesSuccess')});
}


//function createQuestionnairesSuccess(tx, result){
function createQuestionnairesSuccess(callback){
	if(isMobile)
	{
		store = cordova.file.applicationDirectory;
		fileName = "www/db/questionnaires.txt";
		//window.resolveLocalFileSystemURL(store + fileName, readQuestionnairesSuccess, readQuestionnairesFail);
		window.resolveLocalFileSystemURL(store + fileName, function(fileEntry){readQuestionnairesSuccess(fileEntry,callback) }, readQuestionnairesFail);
		//callback(null,'ok');
	}
	else
	{    
		    var req = new XMLHttpRequest();
		    req.open('GET', '../www/db/questionnaires.txt', true);
		    req.onreadystatechange = function (aEvt) {
		      if (req.readyState == 4) {
		         if(req.status == 200)
		        	 {console.log("200000!!!!");
		        	 res = req.responseText;
		        	 insertQuestionnaire(res,callback);
		        	 }
		         else
		        	 console.log("Erreur pendant le chargement de la page.\n");
		      }
		    };
		    req.send(null);
	}
		
	
	console.log("dbquest");
	//callback();
};
function createQuestionnairesError(tx, error) {
    console.log("createQuestionnairesError: " + error.message);
}
function readQuestionnairesSuccess(fileEntry,callback) {
	fileEntry.file(function(file) {
		var reader = new FileReader();
		reader.onloadend = function(e) {
			console.log(' reader');
			res = this.result;
			insertQuestionnaire(res,callback);
		}
		reader.readAsText(file);
	});
}
function readQuestionnairesFail(e) {
	console.log("FileSystem Error");
	console.dir(e);
}
function insertQuestionnaire(res,callback){
	db.transaction(function(tx) {
		var line = res.split("\n");
		for (var linekey in line)
		{
			var line2 = line[linekey].split("';'");
			(function (value) { 
				tx.executeSql('SELECT COUNT("id") as cnt FROM "questionnaires" WHERE sid = "'+line2[0].substring(1,line2[0].length)+'";', [], function(tx, res) {
					if (res.rows.item(0).cnt < 1)
					{
						tx.executeSql('INSERT INTO "questionnaires" (sid, "sdescription-survey_config", gid,qid, question, qtype,"qhelp-question_config", answers) VALUES("'+
								value[0].substring(1,value[0].length)+'","'+
								value[1]+'","'+
								value[2]+'","'+
								value[3]+'","'+
								value[4]+'","'+
								value[5]+'","'+
								value[6]+'","'+
								escape(JSON.stringify(line2[7].substring(0,value[7].length-1)))+'");',[], successHandler, errorHandler);
						//line2[7].substring(0,line2[7].length-1).replace(/"/g,'\\"')+'");',[], successHandler, errorHandler);
					}//fin if
				},errorHandler);//fin select
			})(line2);
		}
	},function(tx){callback(true,'err')},function(tx){callback(null,'ok')});
}



////////////////////
//Functions after_init
function after_init(){
	console.log('after_init');
	if (MC_UseOk)
	{
		console.log('MC_UseOk');
		do_MC_UseOk();
	}
}

////////////////////
//Functions MC_UseOk

function do_MC_UseOk(callback,$location,$route){
	/*$location.path('/scroll'); 
	 console.log('loc3 '+$location);
	 console.log('loc3 '+JSON.stringify($location) );*/
	 
	
	//callback(null,"MC_UseOk_false");
	
	if (MC_UseOk)
	{
		console.log('MC_UseOk');
		db.transaction(function(tx) 
		{
			(function ($location) { 
				//tx.executeSql('INSERT INTO "reponses" (sid, reponse) VALUES ("useOK","'+resultForm+'");
				tx.executeSql('SELECT * FROM "reponses" where sid = "useOK" AND reponse = "ok";', [], function(tx, res) {
					console.log(res);
					var dataset = res.rows.length;
		            if(dataset<1)
					//if (res.rows.item(0).cnt < 1)
					{
						console.log('MC_UseOk:false');
						//Change path
						$location.path('/scroll'); 
						$route.reload();
						//callback(true,"MC_UseOk_false");
						//return false;
					}
					else
					{
						console.log('MC_UseOk:true');
						callback(null,"MC_UseOk_true");
						return true;
					}
						
				});//fin select
			})($location);
		}); //fin db.transaction
	}
	else
		//ok
		callback(null,"no_MC_UseOk");
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

/*function refreshDevices() {
	console.log("refreshDevices")
    $("#deviceList").html('');
	if (typeof window.rfduino === 'object') 
		rfduino.discover(5, onDiscoverDevice, onRfError);
	else
	{
		var listItem = document.createElement('li');
	    var html =  '<a><b>Device Name</b><br/>' +
	                'RSSI: Device RSSI&nbsp;|&nbsp;' +
	                'Advertising: Device advertising<br/>' +
	                'Device UUID</a>';

	    listItem.setAttribute('uuid', 'Device UUID');
	    listItem.setAttribute('deviceName', 'Device Name');
	    listItem.setAttribute('tube', 'Device advertising');
	    listItem.innerHTML = html;
	    $("#deviceList").append(listItem);
	}
}

function onDiscoverDevice(device) {
    var listItem = document.createElement('li');
    var html =  '<a><b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                'Advertising: ' + device.advertising + '<br/>' +
                device.uuid+'</a>';

    listItem.setAttribute('uuid', device.uuid);
    listItem.setAttribute('deviceName', device.name);
    listItem.setAttribute('tube', device.advertising);
    listItem.innerHTML = html;
    $("#deviceList").append(listItem);
    $("#deviceList").on('touchend',connect);
}

function onRfError(error) {
   /* if (error.toUpperCase() === "DISCONNECTED") {
        alert("La connexion au compteur est perdue.");
       // app.disconnect();
    } else {
        alert(error.toUpperCase());
    }*/
	//alert("Error device.");
/*}

function onData(data){
	console.log('onData');
	//alert('onData');
	$('#paquetData').html(data.toString());
}

function connect(e){
	alert('connect');
    var target = e.target;
    var uuid = e.target.getAttribute('uuid');
    if (uuid==null)
        uuid = e.target.parentNode.getAttribute('uuid');
    var onConnect = function() {
    	alert('onConnect');
        deviceName = target.getAttribute("deviceName");
        deviceUUID = uuid;
        tubeType = target.getAttribute("tube");
        rfduino.onData(onData, onRfError);
        //showPageChoixTypeMesure();
        count = 0;
    };

    rfduino.connect(uuid, onConnect, onRfError);
}*/


/////////////////////////////////////////////////////////////////////
//Functions BLE
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
	$scope.devices['0'] = {'name':'device 0','uuid':'deviceid0'};
	$scope.devices['1'] = {'name':'device 1','uuid':'deviceid1'};
	
}

function fakeSearch($scope){
	$scope.state = "2";
	setTimeout(function (){$scope.state = "3";console.log("state3");$scope.$apply();}, 5000);
	setTimeout(function (){$scope.state = "4";console.log("state4");$scope.$apply();}, 6000);
}
function fakeMesure($scope){
	var max = 30;
	for (i=1;i<(max+1);i++)
	{
		(function (value) {
			setTimeout(function (){doProgressBar(value)}, value*(60/max)*1000);
		})(i);
	}
	
	
}

function doProgressBar(mycount){
	var max = 30;
	var percent = mycount*100/max;
	$('.mesure .blocMesure1 .fiability .progressbar2').width( percent+'%');
	if (percent>33)
		$('.mesure .blocMesure1 .fiability .progressbar2').css("background-color","#dfe700");
	if (percent>66)
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
    var buff = new Uint8Array(data);
    var dataView = new DataView(data);
    var data2 = data.slice(4);
    var dataView2 = new DataView(data2);
    myData = {}
    
    while (offset < buff.length) {
        var logMsg = "> ";
        var hex = [];
        
        var type = dataView.getUint8(offset); 
        hex.push((buff[offset]>>>4).toString(16)+(buff[offset]&0xF).toString(16));
        offset++;
        
        myData[type] ={};
        
        myData[type]['data'] = dataView.getUint8(offset); 
        myData[type]['data2'] = dataView.getUint8(offset+1); 
        myData[type]['data3'] = dataView.getUint8(offset+2); 
        myData[type]['data4'] = dataView.getUint8(offset+3); 
        
        for (var i=offset ; i<offset+4 ; i++) {
            hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
        }
        offset += 4;
        
      /*  switch (type) {
            case 0x01: // Yaw
                compass.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0x02: // Pitch
                horizon.pitch = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0x03: // Roll
                horizon.roll = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0x04: // Trust
                powerGauge.value = Math.round(dataView.getFloat32(offset, true));
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0x05: // M1
                m1Gauge.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0x06: // M2
                m2Gauge.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0x07: // M3
                m3Gauge.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0x08: // M4
                m4Gauge.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0x09: // Battery Voltage
                batteryVoltageValue = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0x0A: // Temperature
                temperatureValue = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0x0B: // Altitude
                altitudeValue = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0x0C: // Mode
                modeMenu.setMode(dataView.getUint8(offset));
                hex.push((buff[offset]>>>4).toString(16)+(buff[offset]&0xF).toString(16));
                offset++;
                break;*/
            
            /*******************/
            /* Paquets mémoire */
            /*******************/
            
          /*  case 0xFF: // Yaw kP
                kPYawSlider.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0xFE: // Yaw kI
                kIYawSlider.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0xFD: // Yaw kD
                kDYawSlider.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0xFC: // Pitch kP
                kPPitchSlider.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0xFB: // Pitch kI
                kIPitchSlider.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0xFA: // Pitch kD
                kDPitchSlider.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0xF9: // Roll kP
                kPRollSlider.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0xF8: // Roll kI
                kIRollSlider.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0xF7: // Roll kD
                kDRollSlider.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0xF6: // Trust kP
                kPTrustSlider.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0xF5: // Trust kI
                kITrustSlider.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            case 0xF4: // Trust kD
                kDTrustSlider.value = dataView.getFloat32(offset, true);
                for (var i=offset ; i<offset+4 ; i++) {
                    hex.push((buff[i]>>>4).toString(16)+(buff[i]&0xF).toString(16));
                }
                offset += 4;
                break;
            default: break;
        }*/
        
        // Log data
        logMsg += hex.join(" ").toUpperCase();
        //logger.log(logMsg);
        return myData;
       // return hex;
    }
}

function convertNanosievert(nbCoup,duration)
{
	valueNSV = (parseInt(nbCoup) * 0.9) / (parseInt(duration) * 60) ;
	return valueNSV;
}