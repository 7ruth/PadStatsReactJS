(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', './GoogleApiComponent', './components/Marker', './components/InfoWindow', 'react', 'react-dom', './lib/String', './lib/cancelablePromise', 'invariant'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('./GoogleApiComponent'), require('./components/Marker'), require('./components/InfoWindow'), require('react'), require('react-dom'), require('./lib/String'), require('./lib/cancelablePromise'), require('invariant'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.GoogleApiComponent, global.Marker, global.InfoWindow, global.react, global.reactDom, global.String, global.cancelablePromise, global.invariant);
    global.index = mod.exports;
  }
})(this, function (exports, _GoogleApiComponent, _Marker, _InfoWindow, _react, _reactDom, _String, _cancelablePromise, _invariant) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Map = exports.InfoWindow = exports.Marker = exports.GoogleApiWrapper = undefined;
  Object.defineProperty(exports, 'GoogleApiWrapper', {
    enumerable: true,
    get: function () {
      return _GoogleApiComponent.wrapper;
    }
  });
  Object.defineProperty(exports, 'Marker', {
    enumerable: true,
    get: function () {
      return _Marker.Marker;
    }
  });
  Object.defineProperty(exports, 'InfoWindow', {
    enumerable: true,
    get: function () {
      return _InfoWindow.InfoWindow;
    }
  });

  var _react2 = _interopRequireDefault(_react);

  var _reactDom2 = _interopRequireDefault(_reactDom);

  var _invariant2 = _interopRequireDefault(_invariant);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var mapStyles = {
    container: {
      position: 'absolute',
      width: '100%',
      height: '100%'
    },
    map: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      top: 0
    }
  };

  var evtNames = ['ready', 'click', 'dragend', 'recenter'];
  var pastCounters;
  var counter = 0;
  var directionsRendererArray = [];
  var infowindow;
  var markerObject = {};
  var infoWindowObject = {};
  var distances = {};

  var Map = exports.Map = function (_React$Component) {
    _inherits(Map, _React$Component);

    function Map(props) {
      _classCallCheck(this, Map);

      var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this, props));

      (0, _invariant2.default)(props.hasOwnProperty('google'), 'You must include a `google` prop.');

      _this.listeners = {};
      _this.state = {
        currentLocation: {
          lat: _this.props.initialCenter.lat,
          lng: _this.props.initialCenter.lng
        }
      };
      return _this;
    }

    _createClass(Map, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        if (this.props.centerAroundCurrentLocation) {
          if (navigator && navigator.geolocation) {
            this.geoPromise = (0, _cancelablePromise.makeCancelable)(new Promise(function (resolve, reject) {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            }));

            this.geoPromise.promise.then(function (pos) {
              var coords = pos.coords;
              _this2.setState({
                currentLocation: {
                  lat: coords.latitude,
                  lng: coords.longitude
                }
              });
            }).catch(function (e) {
              return e;
            });
          }
        }
        this.loadMap();
      }
    }, {
      key: 'componentDidUpdate',
      value: function componentDidUpdate(prevProps, prevState) {
        if (prevProps.google !== this.props.google) {
          this.loadMap();
        }
        if (this.props.visible !== prevProps.visible) {
          this.restyleMap();
        }
        if (this.props.center !== prevProps.center) {
          this.setState({
            currentLocation: this.props.center
          });
        }
        if (prevState.currentLocation !== this.state.currentLocation) {
          this.recenterMap();
        }
        //if directions opts (results, start, end) change, set new directions to Maps new state
        if (this.props.directions !== prevProps.directions) {
          this.setState({
            currentLocation: this.props.center,
            currentCounters: this.props.counters,
            currentPoiObject: this.props.poiObject,
            currentDirections: this.props.directions,
            currentCategory: this.props.category,
            initialCategories: this.props.initialCategories
          });
        }
        if (prevState.currentDirections !== this.state.currentDirections) {
          this.directionsMap(this.props.userSelection);
        }
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        var _this3 = this;

        var google = this.props.google;

        if (this.geoPromise) {
          this.geoPromise.cancel();
        }
        Object.keys(this.listeners).forEach(function (e) {
          google.maps.event.removeListener(_this3.listeners[e]);
        });
      }
    }, {
      key: 'loadMap',
      value: function loadMap() {
        var _this4 = this;

        if (this.props && this.props.google) {
          var _google = this.props.google;

          var maps = _google.maps;

          var mapRef = this.refs.map;
          var node = _reactDom2.default.findDOMNode(mapRef);
          var curr = this.state.currentLocation;
          var center = new maps.LatLng(curr.lat, curr.lng);

          var mapConfig = Object.assign({}, {
            center: center,
            zoom: this.props.zoom
          });

          this.map = new maps.Map(node, mapConfig);

          evtNames.forEach(function (e) {
            _this4.listeners[e] = _this4.map.addListener(e, _this4.handleEvent(e));
          });
          maps.event.trigger(this.map, 'ready');
          this.forceUpdate();
        }
      }
    }, {
      key: 'handleEvent',
      value: function handleEvent(evtName) {
        var _this5 = this;

        var timeout = void 0;
        var handlerName = 'on' + (0, _String.camelize)(evtName);

        return function (e) {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }
          timeout = setTimeout(function () {
            if (_this5.props[handlerName]) {
              _this5.props[handlerName](_this5.props, _this5.map, e);
            }
          }, 0);
        };
      }
    }, {
      key: 'recenterMap',
      value: function recenterMap() {
        var map = this.map;

        var google = this.props.google;

        var maps = google.maps;

        if (!google) return;

        if (map) {
          var center = this.state.currentLocation;
          if (!(center instanceof google.maps.LatLng)) {
            center = new google.maps.LatLng(center.lat, center.lng);
          }
          // map.panTo(center)
          map.setCenter(center);
          maps.event.trigger(map, 'recenter');
        }
      }
    }, {
      key: 'directionsMap',
      value: function directionsMap(userSelection) {

        var map = this.map;

        var google = this.props.google;

        var maps = google.maps;

        if (!this.state.currentCategory && counter <= this.state.initialCategories.length) {
          // if this is an initial load on a new address (due to counter being 0) (but not an initial load of the site (directionsRendererArray is filled)), clean routes
          if (counter === 0) {
            for (var i = 0; i < Object.keys(directionsRendererArray).length; i++) {
              directionsRendererArray[Object.keys(directionsRendererArray)[i]].setMap(null);
            }
          }

          var directionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            draggable: false,
            map: map,
            polylineOptions: new google.maps.Polyline({ strokeColor: rainbow(Math.round(Math.random() * 100), Math.round(Math.random() * 9))
            }) });
          directionsRendererArray[this.props.userSelection[counter]] = directionsRenderer;
          directionsRendererArray[this.props.userSelection[counter]].setMap(map);
          directionsRendererArray[this.props.userSelection[counter]].setDirections(this.state.currentDirections);
          //use counter and Counters to select the poi object thats being routed
          var routedPoi = this.state.currentPoiObject[this.props.userSelection[counter]][this.state.currentCounters[this.props.userSelection[counter]]];
          // create a marker for current POI and category
          this.createMarker(routedPoi, this.props.userSelection[counter]);
          //calc distance and time to the POI from the center address
          var origin_lat = this.state.currentLocation.lat();
          var origin_lng = this.state.currentLocation.lng();
          var latitude = routedPoi.geometry.location.lat();
          var longitude = routedPoi.geometry.location.lng();
          //clean up distances object if user selection has changed
          if (Object.keys(distances).length / 2 > this.props.userSelection.length) {
            for (var i = 0; i < Object.keys(distances).length; i += 2) {
              if (this.props.userSelection.indexOf(Object.keys(distances)[i]) == -1) {
                delete distances[Object.keys(distances)[i]];
                delete distances[Object.keys(distances)[i + 1]];
              }
            }
          }
          console.log(distances);
          distances[this.props.userSelection[counter]] = this.calcDistance(origin_lat, origin_lng, latitude, longitude);
          //calc travel time to the POI
          distances[this.props.userSelection[counter] + "TravelTime"] = this.computetime(directionsRendererArray[this.props.userSelection[counter]].directions);
          //export distances object to MainMap component for rendering on the SidePanel component
          this.props.exportObject(distances);
          /////////////////////////////////////////////////////////////////
          counter += 1;
          if (counter === this.props.userSelection.length) {
            counter = 0;
          }
          //if +/- arrows are activated
        } else {
          //clear previous renderer
          directionsRendererArray[this.state.currentCategory].setMap(null);
          //pass renderer to map
          directionsRendererArray[this.state.currentCategory].setMap(map);
          //pass options with results, start and end to the renderer on the map
          directionsRendererArray[this.state.currentCategory].setDirections(this.state.currentDirections);
          //set marker and info window
          routedPoi = this.state.currentPoiObject[this.state.currentCategory][this.state.currentCounters[this.state.currentCategory]];
          this.createMarker(routedPoi, this.state.currentCategory);
          //calc distance and time to the POI from the center address
          var origin_lat = this.state.currentLocation.lat();
          var origin_lng = this.state.currentLocation.lng();
          var latitude = routedPoi.geometry.location.lat();
          var longitude = routedPoi.geometry.location.lng();
          distances[this.state.currentCategory] = this.calcDistance(origin_lat, origin_lng, latitude, longitude);
          //calc travel time to the POI
          distances[this.state.currentCategory + "TravelTime"] = this.computetime(directionsRendererArray[this.state.currentCategory].directions);
          //export distances object to MainMap component for rendering on the SidePanel component
          this.props.exportObject(distances);
        }
        //Coloring function for routes
        function rainbow(numOfSteps, step) {
          // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
          // Adam Cole, 2011-Sept-14
          // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
          var r, g, b;
          var h = step / numOfSteps;
          var i = ~~(h * 10);
          var f = h * 10 - i;
          var q = 1 - f;
          switch (i % 10) {
            case 0:
              r = 1, g = f, b = 0;break;
            case 1:
              r = q, g = 1, b = 0;break;
            case 2:
              r = 0, g = 1, b = f;break;
            case 3:
              r = 0, g = q, b = 1;break;
            case 4:
              r = f, g = 0, b = 1;break;
            case 5:
              r = 1, g = 0, b = q;break;
          }
          var c = "#" + ("00" + (~~(r * 255)).toString(16)).slice(-2) + ("00" + (~~(g * 255)).toString(16)).slice(-2) + ("00" + (~~(b * 255)).toString(16)).slice(-2);
          return c;
        }
        pastCounters = this.state.currentCounters;
      }
    }, {
      key: 'restyleMap',
      value: function restyleMap() {
        if (this.map) {
          var _google2 = this.props.google;

          _google2.maps.event.trigger(this.map, 'resize');
        }
      }
    }, {
      key: 'renderChildren',
      value: function renderChildren() {
        var _this6 = this;

        var children = this.props.children;


        if (!children) return;

        return _react2.default.Children.map(children, function (c) {
          return _react2.default.cloneElement(c, {
            map: _this6.map,
            google: _this6.props.google,
            mapCenter: _this6.state.currentLocation
          });
        });
      }
    }, {
      key: 'createMarker',
      value: function createMarker(place, category) {
        var map = this.map;
        var google = this.props.google;

        var maps = google.maps;

        if (place === "undefined" || place === undefined) {
          return;
        } else {
          // Marker settings
          var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            visible: false
          });
          //Overwrite previous marker for this category
          if (markerObject[category]) {
            markerObject[category].setMap(null);
          }
          //delete any extra markers (if user unchecked a category)
          if (Object.keys(markerObject).length > this.props.userSelection.length) {
            for (var i = 0; i < Object.keys(markerObject).length; i++) {
              if (this.props.userSelection.indexOf(Object.keys(markerObject)[i]) == -1) {
                markerObject[Object.keys(markerObject)[i]].setMap(null);
                delete markerObject[Object.keys(markerObject)[i]];
              }
            }
          }
          // Set new marker after cleanup
          markerObject[category] = marker;
          // Info Window Settings
          infowindow = new google.maps.InfoWindow();
          infoWindowObject[category] = infowindow;
          infoWindowObject[category].setContent(place.name);
          infoWindowObject[category].open(map, markerObject[category]);
        }
      }
    }, {
      key: 'calcDistance',
      value: function calcDistance(fromLat, fromLng, toLat, toLng) {
        return google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(fromLat, fromLng), new google.maps.LatLng(toLat, toLng));
      }
    }, {
      key: 'computetime',
      value: function computetime(result) {
        var time = 0;
        var mytravelroute = result.routes[0];
        for (var i = 0; i < mytravelroute.legs.length; i++) {
          time += mytravelroute.legs[i].duration.value;
        }
        var totalSec = time;
        var hours = parseInt(totalSec / 3600);
        var minutes = parseInt(totalSec / 60) % 60;
        var seconds = totalSec % 60;
        var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        return result;
      }
    }, {
      key: 'render',
      value: function render() {
        var style = Object.assign({}, mapStyles.map, this.props.style, {
          display: this.props.visible ? 'inherit' : 'none'
        });

        var containerStyles = Object.assign({}, mapStyles.container, this.props.containerStyle);

        return _react2.default.createElement(
          'div',
          { style: containerStyles, className: this.props.className },
          _react2.default.createElement(
            'div',
            { style: style, ref: 'map' },
            'Loading map...'
          ),
          this.renderChildren()
        );
      }
    }]);

    return Map;
  }(_react2.default.Component);

  ;

  Map.propTypes = {
    google: _react.PropTypes.object,
    zoom: _react.PropTypes.number,
    centerAroundCurrentLocation: _react.PropTypes.bool,
    center: _react.PropTypes.object,
    initialCenter: _react.PropTypes.object,
    className: _react.PropTypes.string,
    style: _react.PropTypes.object,
    containerStyle: _react.PropTypes.object,
    visible: _react.PropTypes.bool
  };

  evtNames.forEach(function (e) {
    return Map.propTypes[(0, _String.camelize)(e)] = _react.PropTypes.func;
  });

  Map.defaultProps = {
    zoom: 9,
    initialCenter: {
      lat: 51.380492,
      lng: -68.697407
    },
    center: {},
    centerAroundCurrentLocation: false,
    style: {},
    containerStyle: {},
    visible: true
  };

  exports.default = Map;
});