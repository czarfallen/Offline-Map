angular.module('app')

    .factory('LeafletMapFactory', function ($q,
                                            $rootScope,
                                            incident,
                                            tblLeafletMap,
                                            tblLeafletMapDatabaseFile) {

        var service = {

            // for get demo data :
            getDemoData: function(){
                var deferred = $q.defer();
                tblLeafletMap.all().then(function(data){
                    deferred.resolve(data);
                });
                return deferred.promise;
            },


            getEntityList: function(){
                var deferred = $q.defer();
                tbl_WMS_entity.getEntityOptionList().then(function(data){
                    deferred.resolve(data);
                });
                return deferred.promise;
            },



            getTransRefLine: function(){
                var deferred = $q.defer();
                tbl_trans_ref_line.getWithFilter().then(function(data){
                    deferred.resolve(data);
                });
                return deferred.promise;
            },

            getTransRefLineFullInfo: function(){
                var deferred = $q.defer();
                tbl_trans_ref_line.getWithFullInfo().then(function(data){
                    deferred.resolve(data);
                });
                return deferred.promise;
            },

            getAllTransRefHeader: function(key){
                var deferred = $q.defer();
                tbl_WMS_trans_ref_hdr.getWithFilter(key).then(function(data){
                    // Search by pref
                    if(data.length > 0){
                        deferred.resolve(data);
                    }else{
                        // Search by item code
                        tbl_trans_ref_line.getWithFilter(key).then(function(data) {
                            if (data.length > 0) {
                                var sourceData = data;
                                tbl_WMS_trans_ref_hdr.getWithFilter(sourceData[0].smh_ref).then(function(data){
                                    deferred.resolve(data);
                                });


                            }
                        });
                    }

                });
                return deferred.promise;
            },



            saveData: function(tableObj){

                tblLeafletMap.add(tableObj);
            },

            deleteData: function (layerID) {
                var q = $q.defer();
                tblLeafletMap.remove(layerID).then(function(){
                    q.resolve()
                });
                return q.promise;
            },
            isLayerShowHide: function (layer) {
                tblLeafletMap.updatesent(layer);
            },
            allLayerHide: function (layer) {
                tblLeafletMap.hideAllLayer(layer);
            },
            renameLayer: function (layer) {
                return tblLeafletMap.editLayer(layer);
            },
            saveFile: function(file){
                var q = $q.defer();
                tblLeafletMap.addFile(file).then(function(data){
                    q.resolve(data)
                });
                return q.promise;
            },
            getFileData: function(){
                var deferred = $q.defer();
                tblLeafletMap.allFileData().then(function(data){
                    deferred.resolve(data);
                });
                return deferred.promise;
            },
            isFileShowHide: function (file) {
                tblLeafletMap.updatesentFile(file);
            },
            renameFile: function (file) {
                return tblLeafletMap.editFile(file);
            },
            deleteFile: function (fileId) {
                var q = $q.defer();
                tblLeafletMap.removeFile(fileId).then(function(){
                    q.resolve()
                });
                return q.promise;
            },
            allFilesHide: function (file) {
                tblLeafletMap.hideAllFiles(file);
            },
            getLayerById: function(id){
                var q = $q.defer();
                tblLeafletMap.getLayerById(id).then(function(rs){
                    q.resolve(rs);
                });
                return q.promise;
            },

            getDatabaseFile: function(){
                let q = $q.defer();

                $q.all([tblLeafletMapDatabaseFile.get(), tblLeafletMapDatabaseFile.getStyles()]).then(
                    data => q.resolve(data)
                );

                return q.promise;
            }
        };

        return service;
    });
