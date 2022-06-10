angular.module('app')

    .directive('map', function() {
        return {
            restrict: 'E',
            scope: {
                onCreate: '&'
            },
            link: function ($scope, $element, $attr) {
                function initialize() {
                    var mapOptions = {
                        center: new google.maps.LatLng(-12.42115381, 130.87463379),
                        zoom: 12,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    var map = new google.maps.Map($element[0], mapOptions);

                    $scope.onCreate({map: map});

                    // Stop the side bar from dragging when mousedown/tapdown on the map
                    google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
                        e.preventDefault();
                        return false;
                    });
                }

                if (document.readyState === "complete") {
                    initialize();
                } else {
                    google.maps.event.addDomListener(window, 'load', initialize);
                }
            }
        }
    })

    /***
     * filtered-input="number"
     * filtered-input="alphabet"
     * filtered-input="alphaNumeric"
     */
    .filter('filterPattern', function () {
        return function (input, pattern) {
            if (input === undefined) {
                return input;
            }
            if (pattern.indexOf('number') !== -1) {
                input = input.replace(/[^\-\d.]/g, '');
            } else if (pattern.indexOf('alphabet') !== -1) {
                input = input.replace(/[^a-zA-Z]/g, '');
            } else if (pattern.indexOf('alphaNumeric') !== -1) {
                input = input.replace(/[^a-zA-Z\d]/g, '');
            }

            return input;
        };
    })

    .directive('filteredInput', function ($filter) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: true,
            link: function (scope, element, attrs, controller) {
                controller.$parsers.unshift(function (val) {
                    var newVal = $filter('filterPattern')(val, attrs.filteredInput);
                    element[0].value = newVal;

                    return newVal;
                });
            }
        };
    })

    .directive('uploadPhoto', function () {
        return {
            restrict: 'EA',
            scope: {
                change: '&'
            },
            template: '<img src="img/icons/addphoto.png" width="100%" height="100%" ng-click="selectFile()"/>' +
            '<input type="file" class="hide" onchange="angular.element(this).scope().setFiles(this)" accept="image/*"/>',
            link: function ($scope, $element) {
                $scope.selectFile = function () {
                    $element.children()[1].click();
                };

                $scope.setFiles = function (fileInput) {
                    $scope.change()(fileInput.files);
                    fileInput.value = null;
                };

                $element.on('$destroy', function () {
                    // remove reference to this scope.
                    $scope.$destroy();
                });
            }
        };
    })

    .directive('nextInput', function () {
        return {
            restrict: 'A',
            link: function($scope,element,attrs) {

                element.bind('keyup', function(e) {
                    var code = e.keyCode || e.which;
                    if (code === 13) {
                        e.preventDefault();
                        //element.next()[0].focus();
                        var pageElements = document.querySelectorAll('input, select'),
                            focusNext = false,
                            len = pageElements.length;
                        for (var i = 0; i < len; i++) {
                            var elem = pageElements[i];
                            if (focusNext) {
                                if (elem.style.display !== 'none') {
                                    elem.focus();
                                    break;
                                }
                            } else if (elem.$$hashKey == e.currentTarget.$$hashKey) {
                                focusNext = true;
                            }
                        }
                    }
                });

                element.on("$destroy",function() {
                    // remove reference to this scope.
                    $scope.$destroy();
                    element.off();
                });
            }
        };
    })
    .directive('lessText', function ($timeout) {
        return {
            restrict: 'A',
            link: function($scope,element,attrs) {
                var originalText = null;
                var lesser = true;
                $timeout(function() {
                    originalText = element[0].textContent;
                    if(originalText.length > 10){
                        element.text(originalText.substring(0,8)+'...');
                    }
                });

                element.bind("click", function(e){
                    if(attrs.class != 'tooltips'){
                        lesser = !lesser;
                        if(lesser){
                            element.text(originalText);
                        }else{
                            if(originalText.length > 10){
                                element.text(originalText.substring(0,8)+'...');
                            }
                        }
                    }
                });
            }
        };
    })
    .directive('wrapText', function ($timeout,$rootScope) {
        return {
            restrict: 'A',
            link: function($scope,element,attrs) {
                $scope.originalText = element[0].textContent;
                // Default text length
                var acceptableLength = 10;

                // Listen option update
                var listener = $rootScope.$on('chosenOptionUpdate', function(event, data){
                    $timeout(function() {
                        originalText = data.text;
                        // If text length exceed limit
                        if(originalText.length > acceptableLength){
                            element.text(originalText.substring(0,acceptableLength)+'...');
                        }else{
                            element.text(originalText);
                        }
                    })

                });

                $timeout(function() {
                    acceptableLength = (Math.round((element[0].parentElement.clientWidth - 130)/10));
                    originalText = element[0].textContent;
                    if(originalText.length > acceptableLength){
                        element.text(originalText.substring(0,acceptableLength)+'...');
                    }
                });

                element.on("$destroy",function() {
                    // Destroy event
                    listener();

                    // remove reference to this scope.
                    $scope.$destroy();
                    element.off();
                });
            }
        };
    })
    .directive('focusInput', function ($timeout) {
        return {
            restrict: 'EA',
            link: function($scope,element,attrs) {
                var obj = element.find("input");

                element.bind("click", function(e){
                    // Dont focus input field if user click on button in current container
                    if(e.target.localName != 'button'){
                        $timeout(function(){
                            obj.focus();
                        });
                    }
                });

                element.on("$destroy",function() {
                    // remove reference to this scope.
                    $scope.$destroy();
                    element.off();
                });
            }
        };
    })
    // .directive('tooltips', function () {
    //     return {
    //         restrict: 'C',
    //         link: function (scope, element, attrs) {
    //             if (attrs.title) {
    //                 var $element = $(element);
    //                 $element.attr("title", attrs.title);
    //                 $element.tooltipster({
    //                     animation: attrs.animation,
    //                     trigger: "click",
    //                     position: "top",
    //                     positionTracker: true,
    //                     maxWidth: 500,
    //                     contentAsHTML: true,
    //                     theme: 'tooltipster-borderless'
    //                 });
    //             }
    //         }
    //     };
    .directive('relativeTime', function($timeout,utils) {

        return {
            restrict: 'A',
            scope: {
                actualTime: '=relativeTime'
            },
            link: function($scope, element) {
                var timeout = null;

                function update() {
                    element.text(utils.timeSince(new Date($scope.actualTime)));
                    timeout = $timeout(function() {update();}, 30000);
                }

                update();

                $scope.$on("$destroy",function() {
                    $timeout.cancel(timeout);
                });
            }
        };
    })
    .directive('localTime', function($timeout,utils) {

        return {
            restrict: 'A',
            scope: {
                actualTime: '=localTime'
            },
            link: function($scope, element) {
                var timeout = null;

                function update() {
                    element.text(moment($scope.actualTime).format('HH:mm D/M/YYYY'));
                    timeout = $timeout(function() {update();}, 30000);
                }

                update();

                $scope.$on("$destroy",function() {
                    $timeout.cancel(timeout);
                });
            }
        };
    });
