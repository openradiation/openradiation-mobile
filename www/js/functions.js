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
    	db = window.sqlitePlugin.openDatabase("Database", "1.0", "Demo", -1);
    else
    	db = openDatabase("Database", "1.0", "Demo", -1);
	callback(null,'initDb');
}



function createTableQuestionnaires(callback)
{
	db.transaction(function(tx) 
			{  
				
				// id                 
				// sid : Survey ID
				// sdescription-survey_config : configuration (ex: #scheduling:D#duration:2400#startHour:10/18#maxOccurences:42#dayOff:0#test:1#)
				// gid : group ID?
				// qid : question ID
				// question
				// qtype -> template question
				// qhelp-question_config -> Configuration : template question complément, fréquence (ex: #tpl:sl7#frq:b#)
				// answers : jsontab? ex : radio buttons

				//tx.executeSql('DROP TABLE IF EXISTS "questionnaires"');
				tx.executeSql('CREATE TABLE IF NOT EXISTS "questionnaires" ' +
								' ("id" INTEGER PRIMARY KEY AUTOINCREMENT , ' +
								'  "sid" VARCHAR,' +
								'  "sdescription-survey_config" VARCHAR,' +
								'  "gid" VARCHAR,' +
								'  "qid" VARCHAR,' +
								'  "question" VARCHAR,' +
								'  "qtype" VARCHAR,' +
								'  "qhelp-question_config" VARCHAR,' +
								'  "answers" VARCHAR );');
								//'  "answers" VARCHAR );',[],callback(null,'createQuestionnairesSuccess'),callback(true,'createQuestionnairesError'));
								//'  "answers" VARCHAR );',[],createQuestionnairesSuccess,createQuestionnairesError);
			//});
			},function(tx){callback(true,'createQuestionnairesError')},function(tx){callback(null,'createQuestionnairesSuccess')});
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
	$scope.devices['0'] = {'name':'device 0','id':'deviceid0'};
	$scope.devices['1'] = {'name':'device 1','id':'deviceid1'};
	
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
