'use strict';

angular.module('app')
    .directive('offlineMap', function() {
        return {
            restrict: 'EA',
            scope: {
            },
            templateUrl: 'modules/OfflineMap/templates/directives/OfflineMap.html',
            controller: function ($scope, $rootScope, $cordovaSQLite, $ionicSideMenuDelegate, $ionicModal, $ionicPopup,
                                  $ionicPlatform, $q, $ionicLoading, utils, $timeout, $stateParams, $state,
                                  OfflineMapFactory, SessionService, tblLeafletMap, LeafletMapFactory) {

                let mapGL = null;
                let map = null;
                let layer = {};
                let sources = {};
                let databaseFileList = [];
                let style = null;

                let path = null;
                let dbPath = null;

                $scope.isSideNavbar = false;
                $scope.layerDataArray = [];
                $scope.filesNameArray = [];
                $scope.objectList = [];


                // Show loading
                $ionicLoading.show({
                    noBackdrop: false,
                    template: '<ion-spinner/>'
                });

                function createStyle (styles) {
                    return styles.reduce((style, layer) => {
                        style.push(Object.assign({id: layer.layerName}, JSON.parse(layer.style)));
                        return style;
                    }, []);
                }

                // Build layer from MBTiles file process
                function buildLayers(list){
                    let q = $q.defer();

                    function buildLayer(list,index){
                        if(index > list.length - 1){
                            q.resolve(true);
                        }else{
                            if(list[index].Type !== 'layer'){
                                buildLayer(list,index+1);
                            }else{
                                let dbOptions = {};

                                if (ionic.Platform.isAndroid()) {
                                    dbOptions = {
                                        name: list[index].FileName,
                                        createFromLocation: 1,
                                        location: 'default',
                                        androidDatabaseImplementation: 2,
                                        androidLockWorkaround: 1
                                    };
                                } else {
                                    dbOptions = {
                                        name: list[index].FileName,
                                        createFromLocation: 1,
                                        location: 'default'
                                    };
                                }

                                window.sqlitePlugin.openDatabase(dbOptions, function(db) {
                                    db.transaction(function(tx) {
                                        var openmaptilesVectorTileOptions = {
                                            rendererFactory: L.canvas.tile,
                                            vectorTileLayerStyles: {},
                                            maxZoom: 18
                                        };

                                        const usedName = list[index].UsedName;
                                        const type = list[index].Type;

                                        if ( type === 'layer') {
                                            layer[usedName] = new L.TileLayer.MBTilesSqlite('',
                                                //layer[list[index].UsedName] = new L.vectorGrid.protobuf('',
                                                openmaptilesVectorTileOptions,  db);
                                        }

                                        buildLayer(list,index+1);
                                    }, function(err) {
                                        q.reject(err);
                                    });
                                });
                            }
                        }
                    }

                    angular.forEach(list, layer => {
                        if (layer.Type === 'vector') {
                            const usedName = layer.UsedName;
                            sources[usedName] = {
                                type: 'mbtiles',
                                path: `modules/OfflineMap/js/sqlLites/${layer.FileName}`
                            };
                        }
                    });

                    buildLayer(list,0);

                    return q.promise;
                }

                function buildMap() {
                    let layerArr = [];

                    // Prepare layer list to init map
                    angular.forEach(Object.keys(layer), function(item){
                        layerArr.push(layer[item]);
                    });

                    // Init map
                    map = new L.Map('leaflet-map',{
                        layers: layerArr,
                        closePopupOnClick: false, // Prevent close popup on click on anywhere
                        editable: true,
                        minZoom: 0,
                        maxZoom: 20
                    }).fitWorld();

                    //Set map to service
                    OfflineMapFactory.map = map;

                    // Set first view
                    map.setView(new L.LatLng(-12.453388235, 130.84143160), 10);

                    // Base layer
                    let baseMaps = {
                        'Base Layer': layerArr[0]
                    };

                    // Add MapboxGL Offline
                    OfflineMapFactory.instantiateMap('styles/style-offline.json')
                        .then(offlineMapboxGLLayer => {
                            offlineMapboxGLLayer.on('layergladd', () => {
                                mapGL = offlineMapboxGLLayer.getMap();
                                angular.forEach(Object.keys(sources), (sourceName) => {
                                    mapGL.addSource(sourceName, sources[sourceName]);
                                });

                                angular.forEach(style, layer => {
                                    mapGL.addLayer(layer);
                                });
                            });
                            offlineMapboxGLLayer.addTo(map);

                            let overlayLayers = {
                                'MapboxGL': offlineMapboxGLLayer
                            };

                            // Add layers to layer control
                            L.control.layers(baseMaps, overlayLayers).addTo(map);
                        });

                    // Hide loading
                    $ionicLoading.hide();

                    // Leaflet Draw
                    var drawnItems = new L.FeatureGroup();
                    map.addLayer(drawnItems);

                    var drawControl = new L.Control.Draw({
                        edit: {
                            featureGroup: drawnItems
                        }
                    });
                    map.addControl(drawControl);

                    map.on(L.Draw.Event.CREATED, e => {
                        let type = e.layerType,
                            layer = e.layer;
                        if (type === 'marker') {
                            // Do marker specific actions
                        }
                        // Do whatever else you need to. (save to db; add to map etc)
                        map.addLayer(layer);
                    });
                }

                // Copy file to database folder success
                function copySuccess() {
                    buildLayers(databaseFileList).then(function(){
                        buildMap();
                    },function(err){
                        // Hide loading
                        $ionicLoading.hide();
                        console.log('-------------- err: '+ JSON.stringify(err));
                    });
                }

                // Copy DB process
                function copyDB(){
                    var defer = $q.defer();

                    function copy(index) {
                        if (index>=databaseFileList.length)
                        {
                            defer.resolve();
                            return;
                        }
                        var dbName = databaseFileList[index].FileName;

                        var deviceInformation = ionic.Platform.device();
                        var devicePlatform = deviceInformation.platform;

                        if(devicePlatform === 'iOS'){
                            path = 'cdvfile://localhost/bundle/www/modules/OfflineMap/js/sqlLites/' + dbName;
                            dbPath = cordova.file.applicationStorageDirectory + 'Library/LocalDatabase';
                        } else {
                            path = cordova.file.applicationDirectory + '/www/modules/OfflineMap/js/sqlLites/' + dbName;
                            dbPath = cordova.file.applicationStorageDirectory + '/databases';
                        }

                        window.resolveLocalFileSystemURL(path, function(fileEntry) {
                            window.resolveLocalFileSystemURL(dbPath, function(dirEntry) {
                                fileEntry.copyTo(dirEntry, dbName, function(newFileEntry) {
                                    copy(index + 1);
                                },function(e){
                                    // If file existed already
                                    if (e.code === 12) {
                                        window.resolveLocalFileSystemURL(dbPath+'/'+dbName, function(fileEntry) {
                                            // Remove file
                                            fileEntry.remove(function(){
                                                // Copy file again
                                                copy(index);
                                            },function(e){ // If error, reject to do nothing
                                                console.log(e);
                                                defer.reject();
                                            });
                                        },function(){// If error, reject to do nothing
                                            console.log(e);
                                            defer.reject();
                                        });
                                    }else{// If error, reject to do nothing
                                        console.log(e);
                                        defer.reject();
                                    }
                                });
                            },function (e) {// If error, reject to do nothing
                                console.log(e);
                                defer.reject();
                            });
                        },function (e) {// If error, reject to do nothing
                            console.log(e);
                            defer.reject();
                        });
                    }

                    copy(0);
                    return defer.promise;
                }

                // Mobile version
                if (window.sqlitePlugin) {
                    // Get file from database
                    LeafletMapFactory.getDatabaseFile().then(function(data) {
                        databaseFileList = data[0];
                        style = createStyle(data[1]);

                        // Copy mbtiles to database folder
                        copyDB().then(function(){
                            // Start to build layer and map
                            copySuccess();
                        },function(){
                            // Hide loading
                            $ionicLoading.hide();
                        });
                    });
                } else { // Desktop version
                    LeafletMapFactory.getDatabaseFile().then(function(data){
                        databaseFileList = data[0];
                        style = createStyle(data[1]);

                        // Build layers base on file list
                        angular.forEach(databaseFileList, function(file){
                            // Only build layer type
                            if(file.Type === 'layer'){
                                layer[file.UsedName] = L.tileLayer.MBTilesSql('modules/OfflineMap/js/sqlLites/' + file.FileName,{
                                    minZoom: file.MinZoom,
                                    maxZoom: file.MaxZoom
                                });
                            } else if (file.Type === 'vector') {
                                sources[file.UsedName] = {
                                    type: 'mbtiles',
                                    path: `modules/OfflineMap/js/sqlLites/${file.FileName}`
                                };
                            }
                        });

                        $timeout(function(){
                            buildMap();
                        });
                    });
                }

                $rootScope.$on('destroyMap',function(){
                    // Remove map
                    if(map){
                        map.remove();
                        OfflineMapFactory.map = null;
                        OfflineMapFactory.mapGL = null;
                    }
                });
            },
            link: function($scope, $element, $attrs) {
                $scope.$on('$destroy', function() {
                    $scope.$destroy();
                    $element.remove();
                });
            }
        };
    });
