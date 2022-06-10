angular.module('app')

    .factory('utils',['$q', function ($q) {

        var service = {
            getCurrentPosition: function () {
                var q = $q.defer();

                var devicePlatForm = ionic.Platform.device().platform;

                // Mobile devices
                if(typeof devicePlatForm != 'undefined'){

                    window.BackgroundGeolocation.getCurrentPosition(function(location){
                        q.resolve(location);
                    },function(err){
                        q.reject(err);
                    },{
                        maximumAge: 7000, // Accept the last-known-location if not older than 5000 ms.
                        samples: 1   // How many location samples to attempt.
                    });

                }else{ // Browsers or other devices that cant get platform
                    q.reject('err');
                }

                return q.promise;
            },

            timeSince: function(date){
                var sPerMinute = 60;
                var sPerHour = sPerMinute * 60;
                var sPerDay = sPerHour * 24;
                var sPerMonth = sPerDay * 30;
                var sPerYear = sPerDay * 365;


                var seconds = Math.floor((new Date() - date) / 1000);
                var restTime = seconds;

                var interval = Math.floor(seconds / 31536000);

                var passYear = 0;
                var passMonth = 0;
                var passDay = 0;
                var passHour = 0;

                // Years ago
                if (interval >= 1) {
                    passYear = interval;
                }

                // Reduce time by years
                if(passYear){
                    restTime = seconds - interval*sPerYear;
                    interval = Math.floor(restTime / 2592000);

                }else{
                    interval = Math.floor(seconds / 2592000);
                }

                // Months ago
                if (interval >= 1) {
                    if(passYear){
                        return passYear + 'y ' + interval + 'm ago'
                    }

                    passMonth = interval;
                }

                // Reduce time by months
                if(passMonth){
                    restTime = restTime-interval*sPerMonth;
                    interval = Math.floor(restTime / 86400);
                }else{
                    interval = Math.floor(seconds / 86400);
                }


                // Days ago
                if (interval >= 1) {
                    if(passMonth){
                        return passMonth + 'm ' + interval + 'd ago'
                    }

                    passDay = interval;
                }

                // Reduce time by days
                if(passDay){
                    restTime = restTime-interval*sPerDay;
                    interval = Math.floor(restTime / 3600);
                }else{
                    interval = Math.floor(seconds / 3600);
                }

                // Hours ago
                if (interval >= 1) {
                    if(passDay){
                        return passDay + 'd ' + interval + 'h ago'
                    }

                    passHour = interval;
                }

                // Reduce time by hours
                if(passHour){
                    restTime = restTime-interval*sPerHour;
                    interval = Math.floor(restTime / 60);
                }else{
                    interval = Math.floor(seconds / 60);
                }

                // Minutes ago
                if (interval >= 1) {
                    if(!passHour){
                        return interval + " m ago"
                    }else{
                        return passHour + 'h ' + interval + 'm ago'
                    }
                }

                return "Just Now"
            }
        };

        return service;
    }]);