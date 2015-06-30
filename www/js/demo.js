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
  'mobile-angular-ui.gestures',
  'starter.services'
  
]);


// 
// You can configure ngRoute as always, but to take advantage of SharedState location
// feature (i.e. close sidebar on backbutton) you should setup 'reloadOnSearch: false' 
// in order to avoid unwanted routing.
// 
app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'templates/home.html', reloadOnSearch: false});
  $routeProvider.when('/scroll',        {templateUrl: 'templates/scroll.html', reloadOnSearch: false}); 
  $routeProvider.when('/toggle',        {templateUrl: 'templates/toggle.html', reloadOnSearch: false}); 
  $routeProvider.when('/tabs',          {templateUrl: 'templates/tabs.html', reloadOnSearch: false}); 
  $routeProvider.when('/accordion',     {templateUrl: 'templates/accordion.html', reloadOnSearch: false}); 
  $routeProvider.when('/overlay',       {templateUrl: 'templates/overlay.html', reloadOnSearch: false}); 
  $routeProvider.when('/forms',         {templateUrl: 'templates/forms.html', reloadOnSearch: false});
  $routeProvider.when('/dropdown',      {templateUrl: 'templates/dropdown.html', reloadOnSearch: false});
  $routeProvider.when('/drag',          {templateUrl: 'templates/drag.html', reloadOnSearch: false});
  $routeProvider.when('/carousel',      {templateUrl: 'templates/carousel.html', reloadOnSearch: false});
  $routeProvider.when('/useok',      	{templateUrl: 'templates/useok.html', reloadOnSearch: false});
  $routeProvider.when('/tab-charts',    {templateUrl: 'templates/tab-charts.html', reloadOnSearch: false});
});




//
// `$drag` example: drag to dismiss
//
app.directive('dragToDismiss', function($drag, $parse, $timeout){
  return {
    restrict: 'A',
    compile: function(elem, attrs) {
      var dismissFn = $parse(attrs.dragToDismiss);
      return function(scope, elem, attrs){
        var dismiss = false;

        $drag.bind(elem, {
          constraint: {
            minX: 0, 
            minY: 0, 
            maxY: 0 
          },
          move: function(c) {
            if( c.left >= c.width / 4) {
              dismiss = true;
              elem.addClass('dismiss');
            } else {
              dismiss = false;
              elem.removeClass('dismiss');
            }
          },
          cancel: function(){
            elem.removeClass('dismiss');
          },
          end: function(c, undo, reset) {
            if (dismiss) {
              elem.addClass('dismitted');
              $timeout(function() { 
                scope.$apply(function() {
                  dismissFn(scope);  
                });
              }, 400);
            } else {
              reset();
            }
          }
        });
      };
    }
  };
});

//
// Another `$drag` usage example: this is how you could create 
// a touch enabled "deck of cards" carousel. See `carousel.html` for markup.
//
app.directive('carousel', function(){
  return {
    restrict: 'C',
    scope: {},
    controller: function($scope) {
      this.itemCount = 0;
      this.activeItem = null;

      this.addItem = function(){
        var newId = this.itemCount++;
        this.activeItem = this.itemCount == 1 ? newId : this.activeItem;
        return newId;
      };

      this.next = function(){
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem == this.itemCount - 1 ? 0 : this.activeItem + 1;
      };

      this.prev = function(){
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
      };
    }
  };
});

app.directive('carouselItem', function($drag) {
  return {
    restrict: 'C',
    require: '^carousel',
    scope: {},
    transclude: true,
    template: '<div class="item"><div ng-transclude></div></div>',
    link: function(scope, elem, attrs, carousel) {
      scope.carousel = carousel;
      var id = carousel.addItem();
      
      var zIndex = function(){
        var res = 0;
        if (id == carousel.activeItem){
          res = 2000;
        } else if (carousel.activeItem < id) {
          res = 2000 - (id - carousel.activeItem);
        } else {
          res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
        }
        return res;
      };

      scope.$watch(function(){
        return carousel.activeItem;
      }, function(n, o){
        elem[0].style['z-index']=zIndex();
      });
      

      $drag.bind(elem, {
        constraint: { minY: 0, maxY: 0 },
        adaptTransform: function(t, dx, dy, x, y, x0, y0) {
          var maxAngle = 15;
          var velocity = 0.02;
          var r = t.getRotation();
          var newRot = r + Math.round(dx * velocity);
          newRot = Math.min(newRot, maxAngle);
          newRot = Math.max(newRot, -maxAngle);
          t.rotate(-r);
          t.rotate(newRot);
        },
        move: function(c){
          if(c.left >= c.width / 4 || c.left <= -(c.width / 4)) {
            elem.addClass('dismiss');  
          } else {
            elem.removeClass('dismiss');  
          }          
        },
        cancel: function(){
          elem.removeClass('dismiss');
        },
        end: function(c, undo, reset) {
          elem.removeClass('dismiss');
          if(c.left >= c.width / 4) {
            scope.$apply(function() {
              carousel.next();
            });
          } else if (c.left <= -(c.width / 4)) {
            scope.$apply(function() {
              carousel.next();
            });
          }
          reset();
        }
      });
    }
  };
});

function alertDismissed() {
    // do something
	//alert('rr');
}

app.controller('MainController', function(cordovaReady,$rootScope, $scope,$location,$route){
	//$location.path('/scroll'); 
	console.log('loc1 '+$location);
	 console.log('loc1 '+JSON.stringify($location) );
	 async.series([	
	               		function(callback){ cordovaReady(callback);},
	               		function(callback){init_DB(callback);},
	               		
	               	//creta table
		               	function(callback){createTableQuestionnaires(callback);},
		               	function(callback){createTableHoraires(callback);},
		               	function(callback){createTableReponses(callback);},
		               	
		               	//create db content
		               //	function(callback){createQuestionnairesSuccess(callback);},
		               	
		               	//test useOk
		               	function(callback){do_MC_UseOk(callback,$location,$route);},
		               	/*function(callback){console.log('loc5 '+$location);
  			 			 console.log('loc5 '+JSON.stringify($location));console.log('toto');alert('toto');$location.path('/scroll');$route.reload();}*/
	               		],
	   				 
	   				 function(err, results ){
	   			 			console.log(results);
	   			 		refreshDevices();
	   			 			//$location.path('/scroll'); 
	   			 			/* console.log('loc4 '+$location);
	   			 			 console.log('loc4 '+JSON.stringify($location) );*/
	   		         }
	   		 );//fin  async.series*/
	 
	 
	 //.then(function(){conole.log('oj')})
	 /*cordovaReady(function () {
		 //$location.path('/scroll'); 
		 console.log('loc2 '+$location);
		 console.log('loc2 '+JSON.stringify($location) );*/
         // Device ready event has fired when this function fires
		 
	/*	 if(isMobile)
		navigator.notification.alert(
		    'You are the winner!',  // message
		    alertDismissed,         // callback
		    'Game Over',            // title
		    'Done'                  // buttonName
		);*/
		 
	/*	 async.series([	function(callback){init_DB(callback);},
		               	//creta table
		               	function(callback){createTableQuestionnaires(callback);},
		               	function(callback){createTableHoraires(callback);},
		               	function(callback){createTableReponses(callback);},
		               	
		               	//create db content
		               	function(callback){createQuestionnairesSuccess(callback);},
		               	
		               	//test useOk
		               	function(callback){do_MC_UseOk(callback,$location);}
		         ],
				 
				 function(err, results,$location ){
			 			console.log(results);
			 			//$location.path('/scroll'); 
			 			 console.log('loc4 '+$location);
			 			 console.log('loc4 '+JSON.stringify($location) );
		         }
		 );//fin  async.series*/
		 

		 
		// if MC_UseOk
//	});//cordovaReady
	// $location.path('/scroll'); 

  // User agent displayed in home page
  $scope.userAgent = navigator.userAgent;
  
  // Needed for the loading screen
  $rootScope.$on('$routeChangeStart', function(){
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function(){
    $rootScope.loading = false;
  });
  
  //Change path
  //$location.path('/scroll'); 
  
 // console.log($rootScope);
  
 
  // Fake text i used here and there.
  $scope.lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel explicabo, aliquid eaque soluta nihil eligendi adipisci error, illum corrupti nam fuga omnis quod quaerat mollitia expedita impedit dolores ipsam. Obcaecati.';

  // 
  // 'Scroll' screen
  // 
  var scrollItems = [];

  for (var i=1; i<=100; i++) {
    scrollItems.push('Item ' + i);
  }

  $scope.scrollItems = scrollItems;

  $scope.bottomReached = function() {
    alert('Congrats you scrolled to the end of the list!');
  }

  // 
  // Right Sidebar
  // 
  $scope.chatUsers = [
    { name: 'Carlos  Flowers', online: true },
    { name: 'Byron Taylor', online: true },
    { name: 'Jana  Terry', online: true },
    { name: 'Darryl  Stone', online: true },
    { name: 'Fannie  Carlson', online: true },
    { name: 'Holly Nguyen', online: true },
    { name: 'Bill  Chavez', online: true },
    { name: 'Veronica  Maxwell', online: true },
    { name: 'Jessica Webster', online: true },
    { name: 'Jackie  Barton', online: true },
    { name: 'Crystal Drake', online: false },
    { name: 'Milton  Dean', online: false },
    { name: 'Joann Johnston', online: false },
    { name: 'Cora  Vaughn', online: false },
    { name: 'Nina  Briggs', online: false },
    { name: 'Casey Turner', online: false },
    { name: 'Jimmie  Wilson', online: false },
    { name: 'Nathaniel Steele', online: false },
    { name: 'Aubrey  Cole', online: false },
    { name: 'Donnie  Summers', online: false },
    { name: 'Kate  Myers', online: false },
    { name: 'Priscilla Hawkins', online: false },
    { name: 'Joe Barker', online: false },
    { name: 'Lee Norman', online: false },
    { name: 'Ebony Rice', online: false }
  ];

  //
  // 'Forms' screen
  //  
  $scope.rememberMe = true;
  $scope.email = 'me@example.com';
  
  $scope.login = function() {
    alert('You submitted the login form');
  };

  // 
  // 'Drag' screen
  // 
  $scope.notices = [];
  
  for (var j = 0; j < 10; j++) {
    $scope.notices.push({icon: 'envelope', message: 'Notice ' + (j + 1) });
  }

  $scope.deleteNotice = function(notice) {
    var index = $scope.notices.indexOf(notice);
    if (index > -1) {
      $scope.notices.splice(index, 1);
    }
  };
  
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
/*app.controller('FormCtrl', function($rootScope, $scope,$location){
	console.log('form');
	console.log(testglobal);
	 $location.path('/toggle'); 
});*/

/* $rootScope.$apply(function() {

$location.path('/scroll'); 
//console.log($location.path());
});*/

//CHARTS
app.controller('ChartsCtrl', function($scope, $filter, Questions, Charts) {

	//current date
	var MyDate = new Date();
	var MyDateString;
	MyDate.setDate(MyDate.getDate() + 20);
	MyDateString =  MyDate.getFullYear() + '-'
    + ('0' + (MyDate.getMonth()+1)).slice(-2) + '-'
    + ('0' + MyDate.getDate()).slice(-2);
	
	
	var sid = 236551;
	moment.locale('fr');
	var curs = moment(MyDateString);
	var curs = moment('2015-01-01');
     period = "1-month";
	
	  $scope.$on('mobile-angular-ui.state.changed.activeTab', function(e, newVal, oldVal) {
		  
		  if (newVal == 1) {
			   period = "1-month";
		  } 
		  else  if (newVal == 2) {
			   period = "2-month";
		  }
		  else  if (newVal == 3) {
			   period = "3-month";
		  }

	var grid = [],
		labels = [];
	if (period == 'weeks') {
		var _in = moment(curs).startOf('isoWeek');
		var _out = moment(curs).endOf('isoWeek');
		var d = moment(_in);
		labels = ['L','M','Me','J','V','S','D'];
		while(d.unix() < _out.unix()) {
			grid.push(d.format('YYYY-MM-DD'));
			d = d.add(1, 'days');
		}
	} else if (period == '1-month') {
		var _in = moment(curs).startOf('month');
		var _out = moment(curs).endOf('month');
		var d = moment(_in);
		while(d.unix() < _out.unix()) {
			grid.push(d.format('YYYY-MM-DD'));
			labels.push((d.format('e')=='0')?d.format('dd D MMM'):'');
			d = d.add(1, 'days');
		}
	} else if (period == '2-month') {
		var _in = moment(curs).startOf('month').subtract('months',1);
		var _out = moment(curs).endOf('month');
		var d = moment(_in);
		while(d.unix() < _out.unix()) {
			grid.push(d.format('YYYY-MM-DD'));
			labels.push((d.format('e')=='0')?d.format('dd D MMM'):'');
			d = d.add(1, 'days');
		}
	} else if (period == '3-month') {
		var _in = moment(curs).startOf('month').subtract('months',2);
		var _out = moment(curs).endOf('month');
		var d = moment(_in);
		while(d.unix() < _out.unix()) {
			grid.push(d.format('YYYY-MM-DD'));
			labels.push((d.format('e')=='0')?d.format('dd D MMM'):'');
			d = d.add(1, 'days');
		}
	}
	
	
	Questions.all({sid:sid}).then(function(response) {
		var q = [];
		angular.forEach(response.data, function(row) {
			if (row.question != "systemuid") {
				q.push({
					label: row.question.replace(/(<([^>]+)>)/ig,"").replace(/\&nbsp;/ig," ").trim(),
					key: sid+'X'+row.gid+'X'+row.qid
				});
			}
		});
		q.push(q.shift()); // first and second at the end (demo)
		q.push(q.shift());
		$scope.questions = q;
		/*Chart.defaults.global = {
		responsive: false,
	    maintainAspectRatio: true
}*/
		
		Charts.all({sid:sid,in:_in.format('YYYY-MM-DD'),out:_out.format('YYYY-MM-DD')}).then(function(response) {
			q.forEach(function(question,i) {
				var el = document.getElementById('chart-'+question.key);
				if (el) {
					var data = {};
					grid.forEach(function(date) {
						data[date] = null;
					});
					angular.forEach(response.data, function(row) {
					//response.data.forEach(function(row) {
						if (row[question.key]) {
							data[row['submitdate'].substr(0,10)] = row[question.key];
						}
					});;
					var strokeColor = "#FFFFFF";
					if (period == '1-month')
						strokeColor = "#157EFB";
					new Chart(el.getContext("2d")).Bar({
						labels: labels,
						datasets: [
							{
								fillColor: "#157EFB",
								strokeColor: strokeColor,
								barStrokeWidth: 1,
								barShowStroke : false,
								barValueSpacing : 1,
								data:data
							}
						]
					}, {
						animation:(i<3)
					});
				}
			});
			
			//$scope.charts = response.data;
		});
		
		$scope.emailMe = function(clickEvent){
		var questionList = "";
		$( "input:checked").each(function( index ) {
			  console.log( index + ": " + $( this ).attr('id') );
			 // console.log($("input:checked"));
			  var str = $( this ).attr('id');
			  var res = str.split("X");
			  console.log(res);
			  var res2 = res[2];
			  console.log(res2);
			  questionList += res[2]+",";
			});
		console.log(questionList);
			if(isMobile)
			{
			var fileTransfer = new FileTransfer();
			var fileURL = cordova.file.dataDirectory+"montest.pdf";
			//test android seulement :
			var fileURL = "cdvfile://localhost/persistent/"+"mesdonnees.pdf"; 
			var uri = "http://restitution.altotoc.fr/pdf?curs=2015-01-01&sid=236551&qid="+questionList; //modif php pour repondre qqchose par defaut si pas de param
			fileTransfer.download(
				    uri,
				    fileURL,
				    function(entry) {
				        console.log("download complete: " + entry.toURL());
				        //envoi mail
				       alert("download complete: " + entry.toURL());
				        cordova.plugins.email.isAvailable(function(result){ 
				        	if (result) //mail dispo
				        	{
				        		cordova.plugins.email.open({
				        			subject: 'rapport données',
				        		    attachments: entry.toURL() //=> res/drawable/icon (Android)
				        		});
				        	}
				        });
				    },
				    function(error) {
				    	//alert("download error source " + error.source);
				    	//alert("download error target " + error.target);
				    	//alert("upload error code" + error.code);
				        //console.log("download error source " + error.source);
				        //console.log("download error target " + error.target);
				        //console.log("upload error code" + error.code);
				    },
				    false,
				    {
				        headers: {
				            "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
				        }
				    }
				);
		}
			else
				console.log("emailMe");
		}
	});
	
	  });// $scope.$on
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