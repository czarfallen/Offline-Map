angular.module('app')
.factory('incident', function ($rootScope) {
    var service = {
     currentIncident: {
      Id: '',
      Name: '',
    }
  };
  return service;
});
