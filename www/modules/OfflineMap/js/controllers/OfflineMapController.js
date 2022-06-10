angular.module('app')
    .controller('OfflineMapController', function($scope, $rootScope, $ionicLoading, OfflineMapFactory) {
        $scope.updateSources = function(){

           // Show loading
            $ionicLoading.show({
                noBackdrop: false,
                template: '<ion-spinner/>'
            });

            // Request remote sources and layers
            OfflineMapFactory.requestData().then(data=>{
                OfflineMapFactory.addRecords('source', data.sources).then( function(response){
                    console.log('sources added', response);
                    OfflineMapFactory.addRecords('style', data.styles).then( function(response){
                        console.log('styles added', response);
                        OfflineMapFactory.map.setView(new L.LatLng(-37.813089, 144.957333), 10);
                        $ionicLoading.hide();
                    }).catch(function(e){
                        $ionicLoading.hide();
                    })
                }).catch(function(e){
                    $ionicLoading.hide();
                });
            })

        };
    });
