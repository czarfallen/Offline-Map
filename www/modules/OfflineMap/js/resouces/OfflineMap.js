'use strict';

// This hack is necessary because ionic proxy conf isn't working properly
const TILESERVER_PORT = '8070';

angular.module('app')
    .factory('OfflineMapFactory', function ($rootScope, $q, $http, LEAFLET_MAP_MODULE_DB_CONFIG, tblLeafletMapDatabaseFile) {
        return {

            map: null,

            mapGL: null,

            useOnlineSourcesIfNotInCordova: function (response) {
                const style = response.data;
                Object.keys(style.sources).map((sourcename) => {
                    const source = style.sources[sourcename];
                    if (source.type === 'mbtiles' && !('sqlitePlugin' in window.self)) {
                        source.type = 'vector';
                        source.tiles = [source.path.split('.').slice(0, -1).join('.') + '/{z}/{x}/{y}.pbf'];
                        delete source.path;
                    }
                });
                return style;
            },

            completeRelativeUrls: function (style) {
                const hasProtocol = /^.+:\/\//;
                const origin = window.location.origin.replace('8100', TILESERVER_PORT);
                let path = origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/';
                Object.keys(style.sources).map((sourcename) => {
                    const source = style.sources[sourcename];
                    if (('data' in source) && (typeof source.data === 'string') && !source.data.match(hasProtocol)) {
                        source.data = path + source.data;
                    }
                    if ('tiles' in source) {
                        source.tiles = source.tiles.map(url => url.match(hasProtocol) ? url : path + url)
                    }
                });
                return style;
            },

            instantiateMap: function (style) {
                return $q((resolve) => {
                    $http.get(style)
                        .then(this.useOnlineSourcesIfNotInCordova)
                        .then(this.completeRelativeUrls)
                        .then(style => {
                            let gl = L.mapboxGL({
                                style: style
                            });
                            this.mapGL = gl;
                            resolve(gl);
                        });
                });
            },

            copyDBFiles: function (databaseFileList) {
                var defer = $q.defer();

                function copy(index) {
                    if (index>=databaseFileList.length)
                    {
                        defer.resolve();
                        return;
                    }
                    var dbName = databaseFileList[index].FileName || databaseFileList[index].fileName;

                    var deviceInformation = ionic.Platform.device();
                    var devicePlatform = deviceInformation.platform;

                    var path = '';
                    var dbPath = '';
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
                                            defer.reject();
                                        });
                                    },function(){// If error, reject to do nothing
                                        defer.reject();
                                    });
                                }else{// If error, reject to do nothing
                                    defer.reject();
                                }
                            });
                        },function (e) {// If error, reject to do nothing
                            defer.reject();
                        });
                    },function (e) {// If error, reject to do nothing
                        defer.reject();
                    });
                }

                copy(0);
                return defer.promise;
            },

            addRecords: function(type,data){
                let defer = $q.defer();
                let recordType = (type == 'style') ?  'tblLeafletMapGLLayers' : 'tblLeafletMapDatabaseFile';

                var _this = this;
                function addRecord(record) {
                    var innerDefer = $q.defer();
                    let recordName = (type == 'style') ? record.layerName : record.usedName ;

                    tblLeafletMapDatabaseFile.existRecord(recordType,recordName)
                    .then(response => {
                        if(response){
                            innerDefer.resolve(false);
                        } else {
                            let p = null;
                            if (type == 'style'){
                                _this.addMapStyle(record);
                                innerDefer.resolve(record);
                            }
                            else {
                                _this.addSource(record).then(response => {
                                    innerDefer.resolve(record);
                                }).catch(error => {
                                    innerDefer.resolve(false);
                                });
                            }
                        }
                    })
                    .catch(function(e){
                        innerDefer.reject(record);
                    });

                    return innerDefer.promise;
                }

                let final = [];
                data.reduce((promise, item) => {
                    return promise.then((results) => {
                        return addRecord(item).then(result => {
                            final.push(result)
                        });
                    })
                    .catch(function(error){
                        return final.push(false)
                    });
                }, Promise.resolve())
                .then(function(response){
                    defer.resolve(final);
                }).catch(function(e){
                    defer.reject(e);
                });

                return defer.promise;
            },

            addSource(source){
                let defer = $q.defer();
                tblLeafletMapDatabaseFile.add(source).then(() => {
                    this.copyDBFiles([source]).then( () => {
                        this.addMapSource(Object.assign({},source));
                        defer.resolve();
                    }).catch(function(error){
                        defer.reject(error);
                    });
                }).catch(error=>{
                    defer.reject(error);
                });
                return defer.promise;
            },

            addMapSource: function (source) {
                const usedName = source.usedName;
                let sourceRef = null;
                if (source.type === 'vector') {
                    sourceRef = {
                        type: 'mbtiles',
                        path: `modules/OfflineMap/js/sqlLites/${source.fileName}`
                    };
                }

                this.mapGL.getMap().addSource(usedName, sourceRef);
            },

            addMapStyle: function (layer) {
                let style = Object.assign({id: layer.layerName}, JSON.parse(layer.style));
                this.mapGL.getMap().addLayer(style);
            },

            requestData(){
                let defer = $q.defer();
                const newSources = [
                    {usedName: 'melbourne',fileName: 'melbourne.mbtiles', minZoom: 0, maxZoom: 20, type: 'vector'}

                ];

                const newStyles = [
                    {"layerName":"landuse-residential-melbourne","style":"{\"type\":\"fill\",\"metadata\":{\"mapbox:group\":\"1444849388993.3071\"},\"source\":\"melbourne\",\"source-layer\":\"landuse\",\"filter\":[\"==\",\"class\",\"residential\"],\"paint\":{\"fill-color\":{\"base\":1,\"stops\":[[12,\"hsla(60,100%,50%, 0.4)\"],[16,\"hsla(60,100%,50%, 0.2)\"]]}}}"}
                ];

                setTimeout(()=>{
                    defer.resolve({
                        sources: newSources,
                        styles: newStyles
                    });
                },100);

                return defer.promise;


            }

        };
    });
