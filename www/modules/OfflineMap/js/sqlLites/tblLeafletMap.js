angular.module('app')
.factory('tblLeafletMap', function (DBA,$q) {

    var service = {
      // this is for ref :
        all: function () {
            return DBA.query("SELECT * FROM tblLeafletmapLayers").then(function (result) {
                return (DBA.getAll(result));
            });
        },
        // for get demo data :
          getWithFullInfoData: function(){
              var deferred = $q.defer();
              var param = 'mihir';
              DBA.query("SELECT * FROM tblLeafletmapLayers WHERE name = ?",param).then(function (result) {
                  deferred.resolve(DBA.getAll(result));
              });
                // DBA.query("SELECT * FROM trans_ref_line").then(function (result) {
                //     deferred.resolve(DBA.getAll(result));
                // });
              return deferred.promise;
          },
          // for add data :
          add: function (item) {
              // console.log("item at sqlight : " + angular.toJson(item , ' '));

                var deferred = $q.defer();
                var parameters = [item.layerName,item.layerID,item.layerType,item.layerData,item.isLayerShow,item.createdDate,item.createdBy,item.circleRadious];
                DBA.query("INSERT INTO tblLeafletmapLayers (layerName,layerID, layerType,layerData,isLayerShow,createdDate,createdBy,circleRadious) VALUES (?,?,?,?,?,?,?,?)", parameters).then(function(){
                    deferred.resolve(true);
                });
                return deferred.promise;
          },


        // for remove data :
           remove: function (layerID) {
              var parameters = [layerID];

              return DBA.query("DELETE FROM tblLeafletmapLayers WHERE layerID = (?)", parameters);
            },

          updatesent: function (layer) {
              if (layer.isLayerShow === "false") {
                  var parameters = ["true", layer.layerID];
              }else if (layer.isLayerShow === null) {
                var parameters = ["true", layer.layerID];
              }else if (layer.isLayerShow === "true") {
                var parameters = ["false", layer.layerID];
              }

               return DBA.query("UPDATE tblLeafletmapLayers SET isLayerShow = (?) WHERE layerID = (?)", parameters);
          },
          hideAllLayer: function (layer) {
              var parameters = ["false", layer.layerID];
               return DBA.query("UPDATE tblLeafletmapLayers SET isLayerShow = (?) WHERE layerID = (?)", parameters);
          },
          editLayer: function (layer) {
              var parameters = [layer.newLayerName, layer.layerID];
               return DBA.query("UPDATE tblLeafletmapLayers SET layerName = (?) WHERE layerID = (?)", parameters);
          },

          ///for add file name in db :
            addFile: function (file) {

                  var deferred = $q.defer();
                  var parameters = [file.fileType,file.fileName,file.fileURL,file.isShow,file.FileId];
                  DBA.query("INSERT INTO tblLeafletFileUrlSave (fileType,fileName,fileURL,isShow,FileId) VALUES (?,?,?,?,?)", parameters).then(function(){
                      deferred.resolve(true);
                  });
                  return deferred.promise;
            },
            allFileData: function () {
                return DBA.query("SELECT * FROM tblLeafletFileUrlSave").then(function (result) {
                    return (DBA.getAll(result));
                });
            },
          updatesentFile: function (file) {
              if (file.isShow === "false") {
                  var parameters = ["true", file.FileId];
              }else if (file.isShow === "true") {
                var parameters = ["false", file.FileId];
              }

               return DBA.query("UPDATE tblLeafletFileUrlSave SET isShow = (?) WHERE FileId = (?)", parameters);
          },
           removeFile: function (fileId) {
              var parameters = [fileId];
              return DBA.query("DELETE FROM tblLeafletFileUrlSave WHERE FileId = (?)", parameters);
            },

          hideAllFiles: function (file) {
              var parameters = ["false", file.FileId];
              return DBA.query("UPDATE tblLeafletFileUrlSave SET isShow = (?) WHERE FileId = (?)", parameters);
          },
          editFile: function (file) {
              var parameters = [file.newFileName, file.FileId];
               return DBA.query("UPDATE tblLeafletFileUrlSave SET fileName = (?) WHERE FileId = (?)", parameters);
          },
          getLayerById: function(id){
              var parameters = [id];
              return DBA.query("SELECT * FROM tblLeafletmapLayers WHERE layerID = (?)", parameters);
          }

     }

  // var service = {
  //   // this is for ref :
  //     all: function () {
  //         return DBA.query("SELECT * FROM tblDemoLeaflet").then(function (result) {
  //             return (DBA.getAll(result));
  //         });
  //     },
  //     // for get demo data :
  //       getWithFullInfoData: function(){
  //           var deferred = $q.defer();
  //           var param = 'mihir';
  //           DBA.query("SELECT * FROM tblDemoLeaflet WHERE name = ?",param).then(function (result) {
  //               deferred.resolve(DBA.getAll(result));
  //           });
  //             // DBA.query("SELECT * FROM trans_ref_line").then(function (result) {
  //             //     deferred.resolve(DBA.getAll(result));
  //             // });
  //           return deferred.promise;
  //       },
  //       // for add data :
  //       add: function (item) {
  //           console.log("item at sqlight : " + angular.toJson(item , ' '));
  //
  //             var deferred = $q.defer();
  //             var parameters = ['102',item.layerType,item.layerData];
  //             DBA.query("INSERT INTO tblDemoLeaflet (Id, name,address) VALUES (?,?,?)", parameters).then(function(){
  //                 deferred.resolve(true);
  //             });
  //             return deferred.promise;
  //       },
  //
  //     // for remove data :
  //        remove: function (member) {
  //           var parameters = ['103'];
  //
  //           return DBA.query("DELETE FROM tblDemoLeaflet WHERE Id = (?)", parameters);
  //         },
  //
  //       ////////////////
  //     getWithFilter: function(key){
  //         var deferred = $q.defer();
  //
  //         if(key){
  //             var param = ['%'+key+'%'];
  //             DBA.query("SELECT * FROM trans_ref_line WHERE if_item_int LIKE ?",param).then(function (result) {
  //                 deferred.resolve(DBA.getAll(result));
  //             });
  //         }else{
  //             DBA.query("SELECT * FROM trans_ref_line").then(function (result) {
  //                 deferred.resolve(DBA.getAll(result));
  //             });
  //         }
  //
  //         return deferred.promise;
  //     },
  //
  //     getWithFullInfo: function(){
  //         var deferred = $q.defer();
  //         DBA.query("SELECT *,(sm_qty - sm_qty) as quantityUsedForBatch FROM trans_ref_line LEFT JOIN item ON trans_ref_line.if_item_int = item.if_item_int").then(function (result) {
  //             deferred.resolve(DBA.getAll(result));
  //         });
  //         return deferred.promise;
  //     },
  //
  //     getInfo: function(itemCode){
  //         var deferred = $q.defer();
  //         var param = ['mihir'];
  //
  //         DBA.query("SELECT * FROM trans_ref_line WHERE name = ?",param).then(function (result) {
  //             deferred.resolve(DBA.getAll(result));
  //         });
  //
  //         return deferred.promise;
  //     },
  //
  //
  //  };

  return service;
})
