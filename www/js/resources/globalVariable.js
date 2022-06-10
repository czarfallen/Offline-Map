angular.module('app')
    .factory('globalVariable', function ($rootScope) {
        var service = {
            timeout: null,
            appVersion: null,
            buildNumber: null,
            manufacturer: null,
            deviceUuid: null,
            role: null,
            shiftId: '',
            caseId: null,
            requestResetCaseId: false,
            facilityName: null,
            heightOfScreen: null,
            widthOfScreen: null,
            currentHeaderOffset: null,
            locationInterval: false,
            dataInitDone: false,
            reloadPage: false,
            currentPlatform: null,
            shiftCheckDone: false,
            mdsInitValue: {
                deviceInformation: null,
                deviceName: null,
                simInformation: null,
                firebaseRegistrationId: null,
                isOnline: null,
                host: {
                    wifi: {
                        address: null,
                        port: null
                    },
                    other:  {
                        address: null,
                        port: null
                    }
                },
                initDone: true
            },
            resetShiftId: function(){
                service.shiftId = null;
            },
            resetCaseId: function(){
                service.caseId = null;
            },
            resetFacilityName: function(){
                service.facilityName = null;
            }
        };
        return service;
    });