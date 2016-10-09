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
    global.placeshelper = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.searchNearby = searchNearby;
  function searchNearby(google, map, request) {
    return new Promise(function (resolve, reject) {
      var service = new google.maps.places.PlacesService(map);

      service.nearbySearch(request, function (results, status, pagination) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {

          resolve(results, pagination);
        } else {
          reject(results, status);
        }
      });
    });
  }
});