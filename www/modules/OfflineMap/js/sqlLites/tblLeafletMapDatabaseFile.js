'use strict';

angular.module('app')
    .factory('tblLeafletMapDatabaseFile', function (DBA,$q) {

        return {
            // this is for ref :
            all: function () {
                return DBA.query("SELECT * FROM tblLeafletMapDatabaseFile").then(function (result) {
                    return (DBA.getAll(result));
                });
            },

            get: function (params) {
                let props = [];
                let values = [];
                let sql = 'SELECT * FROM tblLeafletMapDatabaseFile';

                if (angular.isObject(params)) {
                    angular.forEach(params, function (v, k) {
                        props.push(k + ' = (?)');
                        values.push(v);
                    });
                    if (props.length > 0) {
                        sql += " WHERE " + props.join(' AND ');
                    }
                }

                return DBA.query(sql, values).then(function (result) {
                    return DBA.getAll(result);
                });
            },

            // for add data :
            add: function (item) {
                var deferred = $q.defer();
                var parameters = [item.usedName,item.fileName,item.type,item.minZoom,item.maxZoom];
                DBA.query('INSERT INTO tblLeafletMapDatabaseFile (UsedName,FileName,Type,MinZoom,MaxZoom) ' +
                    'VALUES (?,?,?,?,?)', parameters).then(function(){
                    deferred.resolve(true);
                });
                return deferred.promise;
            },

            // for add data :
            addStyle: function (item) {
                var deferred = $q.defer();
                var parameters = [item.layerName, item.style];
                DBA.query('INSERT INTO tblLeafletMapGLLayers (layerName, style) ' +
                    'VALUES (?,?)', parameters).then(function(){
                    deferred.resolve(true);
                });
                return deferred.promise;
            },

            getStyles: function (params) {
                var props = [];
                var values = [];
                var sql = 'SELECT * FROM tblLeafletMapGLLayers';

                if (angular.isObject(params)) {
                    angular.forEach(params, function (v, k) {
                        props.push(k + ' = (?)');
                        values.push(v);
                    });
                    if (props.length > 0) {
                        sql += ' WHERE ' + props.join(' AND ');
                    }
                }

                return DBA.query(sql, values).then(function (result) {
                    return DBA.getAll(result);
                });
            },

            existRecord: function (tableName, value ) {
                var field = (tableName == 'tblLeafletMapGLLayers') ? 'layerName' : 'UsedName';
                var deferred = $q.defer();
                let sql = 'SELECT * FROM ' + tableName  + ' WHERE ' + field + ' = "' + value + '"'; 
                DBA.query(sql).then(function(result){
                    if(result.rows.length > 0) deferred.resolve(value);
                    else deferred.resolve(false);
                }).catch(function(e){
                    deferred.reject(null);
                });

                return deferred.promise;
            }
        };
    });
