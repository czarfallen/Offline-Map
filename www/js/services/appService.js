angular.module('app')

    .factory('AppService', function ($rootScope, DB_CONFIG, $cordovaSQLite, $ionicModal, DBA, $q, globalVariable) {

        // Init data of table base on table name
        function initTableData(name,i,user){
            var q = $q.defer();
            var record = DB_CONFIG[name][i];
            if(i<DB_CONFIG[name].length){
                eval(name).add(record,user).then(function (res) {
                    initTableData(name,i+1,user).then(function(){
                        q.resolve(true)
                    })
                });
            }else{
                q.resolve(true)
            }
            return q.promise;
        }
        var service = {
            isShowingLoadingScreen: false,
            initTables: function(tableList,i){
                var q = $q.defer();
                if(i<tableList.length){
                    var table = tableList[i];
                    var columns = [];

                    angular.forEach(table.columns, function (column) {
                        columns.push(column.name + ' ' + column.type);
                    });

                    var primarykey = '';
                    if (table.pk.length > 0)
                        primarykey  = ', PRIMARY KEY (' + table.pk.join(',') + ')';
                    else
                        primarykey =  '';
                    var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + primarykey  +  ' )';

                    $cordovaSQLite.execute(db, query).then(function (res){
                        switch (table.name){
                            default: {
                                service.initTables(tableList,i+1).then(function(){
                                    q.resolve(true);
                                });
                            }
                        }
                    }, function (err){
                        q.reject(err);
                    });


                }else{
                    q.resolve(true);
                }
                return q.promise;
            },
            initMDSClient: function(firstInitConnection){
                console.log('------------ Init MDS Client');
                MDSClient.init(firstInitConnection,globalVariable.mdsInitValue.deviceInformation,globalVariable.mdsInitValue.deviceName,globalVariable.mdsInitValue.simInformation,globalVariable.mdsInitValue.firebaseRegistrationId);
            },
            showLoadingScreen: function(){
                if(localStorage.getItem('showLoadingScreen') == 'true'){
                    // Modal to show network
                    $ionicModal.fromTemplateUrl('templates/modals/downloadingScreen.html', {
                        scope: $rootScope,
                        animation: 'slide-in-up',
                        backdropClickToClose: false
                    }).then(function (modal) {
                        $rootScope.downloadingModal = modal;
                        $rootScope.showDownloading = false;
                        $rootScope.downloadingModal.show();

                        if(window.cordova && globalVariable.mdsInitValue.isOnline){
                            $rootScope.showDownloading = true;
                        }

                        // Listen data update
                        $rootScope.$on('initDataUpdateDone', function (event, data) {
                            localStorage.setItem('showLoadingScreen','false');
                            // Hide modal
                            $rootScope.downloadingModal.hide();
                            // Remove modal and remove class, this fixes bugs cant click after modal hide
                            $rootScope.downloadingModal.remove();
                            $('body').removeClass('modal-open');
                        });
                    });
                }
            },
            closeLoadingScreen: function(){
                localStorage.setItem('showLoadingScreen','false');
                // Hide modal
                $rootScope.downloadingModal.hide();
                // Remove modal and remove class, this fixes bugs cant click after modal hide
                $rootScope.downloadingModal.remove();
                $('body').removeClass('modal-open');
            }
        };

        return service;
    });