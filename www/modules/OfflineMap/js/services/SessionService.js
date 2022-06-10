angular.module('app')
.service('SessionService', [function SessionFunction($rootScope, $ionicHistory) {

  var Session = {
    user: null,

    getAllLayer: function() {
      Session.layers = localStorage.getItem("layer");
      return JSON.parse(Session.layers);
    },
    setAllLayer: function(data) {
      Session.layers = JSON.stringify(data);
      localStorage.setItem("layer", Session.layers);
    },


    cache: {},

  };
  return Session;
}]);
