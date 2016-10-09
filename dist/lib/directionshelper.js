(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.directionshelper = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.lookupDirections = lookupDirections;
  function lookupDirections(google, map, request) {

    return new Promise(function (resolve, reject) {
      var directionsService = new google.maps.DirectionsService(map);

      directionsService.route(request, function (results, status, pagination) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          resolve(results, pagination);
        } else {
          reject(results, status);
        }
      });
    });
  }
});