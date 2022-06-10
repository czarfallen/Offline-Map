angular.module('app')

    .factory('DBA', function ($cordovaSQLite, $ionicPlatform, $q) {

        var service = {
            query: function (query, parameters) {
                parameters = parameters || [];
                var q = $q.defer();
                $ionicPlatform.ready(function () {
                    $cordovaSQLite.execute(db, query, parameters).then(function (result) {
                        q.resolve(result);
                    }, function (error) {
                        q.reject(error);
                    });
                });
                return q.promise;
            },


            dobulk: function (query,params,index,querydel,delindx,delparamsindx,updateQuery,updateSeqAfterDelete,delfieldSeq) {
                var q = $q.defer();
                $ionicPlatform.ready(function () {
                    db.transaction(function(tx) {
                        function dobulk(i){
                            if(i < params.length){
                                var recdeleted = false;
                                if (delindx > -1)
                                {
                                    if (params[i][delindx])
                                        recdeleted = true;
                                }
                                if (recdeleted===true)
                                {
                                    var delparams = [];
                                    for (var j=0;j<delparamsindx.length;j++)
                                        delparams.push(params[i][delparamsindx[j]]);
                                    // console.log('Delete' + delparams);
                                    // console.log('Delete' + querydel);

                                    // Delete record
                                    tx.executeSql(querydel, delparams,function(){
                                        // Update seq for current the highest seq
                                        tx.executeSql(updateSeqAfterDelete, [params[i][delfieldSeq]],function(){
                                            delparams=null;
                                            dobulk(i+1)
                                        });
                                    });

                                }
                                else
                                {
                                    // Do update
                                    if(updateQuery){
                                        if(params[i][params[i].length-1] == 'add'){
                                            params[i].pop();
                                            tx.executeSql(query, params[i],function(){
                                                dobulk(i+1)
                                            });
                                        }

                                        if(params[i][params[i].length-1] == 'update'){
                                            params[i] = params[i].splice(1);
                                            params[i].pop();
                                            dobulk(i+1)
                                        }

                                        // For Update setting table
                                        params[i] = params[i].splice(1);
                                        var addParams = params[i];
                                        params[i] = params[i].concat([params[i][0],params[i][1],params[i][params[i].length-1]]);

                                        // Do update row
                                        tx.executeSql(updateQuery, params[i],function(tx,rs){

                                            // If not update, do insert
                                            if(rs.rowsAffected == 0){
                                                tx.executeSql(query, addParams,function(tx,rs){
                                                    dobulk(i+1)
                                                })
                                            }else{
                                                dobulk(i+1)
                                            }
                                        })
                                    }else{ // Do insert
                                        tx.executeSql(query, params[i],function(tx,rs){
                                            dobulk(i+1)
                                        });
                                    }
                                }
                            }

                        }
                        dobulk(0);
                        },
                        function (error) {
                            console.log('Error' + error);
                            q.reject(error);
                        },
                        function () {
                            q.resolve(index);
                        });
                });
                return q.promise;
            },



            querynow: function (query, parameters) {
                parameters = parameters || [];
                $ionicPlatform.ready(function () {
                    var output = [];
                    $cordovaSQLite.execute(db, query, parameters).then(function (result) {
                        for (var i = 0; i < result.rows.length; i++) {
                            output.push(result.rows.item(i));
                        }

                    }, function (error) {
                        console.warn('I found an error');
                        console.warn(error);
                    });

                    return output;
                });
            },



// var updateTableIndex = service.gettblIndexByName(service.data.MDSClientData.tables[tblIndex].colval[0]);
            //          DBA.dobulk(service.data.MDSClientData.tables[updateTableIndex].addsql,service.data.MDSClientData.tables[updateTableIndex].colvalarray,updateTableIndex,service.data.MDSClientData.tables[updateTableIndex].delsql,service.data.MDSClientData.tables[updateTableIndex].delfieldindex,service.data.MDSClientData.tables[updateTableIndex].delparamindex).then(function (index) {
            //                 service.data.MDSClientData.tables[index].colvalarray = [];
            //             });

            // dobulk: function (query,params,index,querydel,delindx,delparamsindx) {
            //   var q = $q.defer();
            //   $ionicPlatform.ready(function () {
            //     db.transaction(function(tx) {
            //       //console.log(query);
            //       //console.log(params);
            //       for (var i = 0; i < params.length; i++)
            //       {
            //           var recdeleted = false;
            //           if (delindx > -1)
            //           {
            //                 if (params[i][delindx])
            //                         recdeleted = true;
            //           }
            //           if (recdeleted===true)
            //           {
            //               var delparams = [];
            //               for (var j=0;j<delparamsindx.length;j++)
            //                   delparams.push(params[i][delparamsindx[j]]);
            //               console.log('Delete' + delparams);
            //               console.log('Delete' + querydel);
            //
            //               tx.executeSql(querydel, delparams);
            //               delparams=null;
            //           }
            //         else
            //          {
            //                  tx.executeSql(query, params[i]);
            //           }
            //       }
            //     },
            //     function (error) {
            //         console.log('Error' + error);
            //         q.reject(error);
            //     },
            //     function () {
            //         q.resolve(index);
            //     });
            //  });
            //  return q.promise;
            // },



            // Proces a result set
            getAll: function (result) {
                var output = [];
                for (var i = 0; i < result.rows.length; i++) {
                    output.push(result.rows.item(i));
                }

                return output;
            },

            // Proces a single result
            getById: function (result) {
                var output = null;
                output = angular.copy(result.rows.item(0));

                return output;
            },
        };

        return service;
    });
