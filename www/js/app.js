// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


var db = null;
angular.module('app', [
    'ionic',
    'ngCordova',
    'angularMoment'
])
    .run(function ($ionicPlatform, $cordovaSQLite, globalVariable, DB_CONFIG, AppService) {
        $ionicPlatform.ready(function () {
            // Get original screen size
            globalVariable.heightOfScreen = window.innerHeight;
            globalVariable.widthOfScreen = window.innerWidth;

            // Store device information
            globalVariable.mdsInitValue.deviceInformation = ionic.Platform.device();

            var type = null;

// ----------------------------------------------------------------
// Init Plugins START
// ----------------------------------------------------------------
            if (window.cordova) {
                if (window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }

                // Init db
                db = $cordovaSQLite.openDB({name: 'database.db', location: 'default'});
            } else {// Ionic serve syntax
                // Init DB
                db = window.openDatabase('database.db', '1.0', 'Database', -1);
            }

// ----------------------------------------------------------------
// Init Plugins STOP
// ----------------------------------------------------------------

            // Init tables
            AppService.initTables(DB_CONFIG.tables,0).then(function(){
                console.log('Init app tables done');
            },function(err){
                console.log(err);
            });
        });
    });
