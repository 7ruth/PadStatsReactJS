import React, {PropTypes as T} from 'react';
import ReactDOM from 'react-dom'
import { camelize } from './lib/String'
import {makeCancelable} from './lib/cancelablePromise'
import invariant from 'invariant'

const mapStyles = {
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
}

const evtNames = ['ready', 'click', 'dragend', 'recenter'];
var pastCounters;
var counter = 0;
var directionsRendererArray = [];
var infowindow;
var markerObject={};
var infoWindowObject={};
var distances = {};

export {wrapper as GoogleApiWrapper} from './GoogleApiComponent'
export {Marker} from './components/Marker'
export {InfoWindow} from './components/InfoWindow'

export class Map extends React.Component {
    constructor(props) {
        super(props)

        invariant(props.hasOwnProperty('google'),
                    'You must include a `google` prop.');

        this.listeners = {}
        this.state = {
          currentLocation: {
            lat: this.props.initialCenter.lat,
            lng: this.props.initialCenter.lng
          },
        }
    }

    componentDidMount() {
      if (this.props.centerAroundCurrentLocation) {
        if (navigator && navigator.geolocation) {
          this.geoPromise = makeCancelable(
            new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            })
          );

        this.geoPromise.promise.then(pos => {
            const coords = pos.coords;
            this.setState({
              currentLocation: {
                lat: coords.latitude,
                lng: coords.longitude
              }
            })
          }).catch(e => e);
        }
      }
      this.loadMap();
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevProps.google !== this.props.google) {
        this.loadMap();
      }
      if (this.props.visible !== prevProps.visible) {
        this.restyleMap();
      }
      if (this.props.center !== prevProps.center) {
        this.setState({
          currentLocation: this.props.center
        })
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
        })
      }
      if (prevState.currentDirections !== this.state.currentDirections) {
        this.directionsMap(this.props.userSelection);
      }
    }


    componentWillUnmount() {
      const {google} = this.props;
      if (this.geoPromise) {
        this.geoPromise.cancel();
      }
      Object.keys(this.listeners).forEach(e => {
        google.maps.event.removeListener(this.listeners[e]);
      });
    }

    loadMap() {
      if (this.props && this.props.google) {
        const {google} = this.props;
        const maps = google.maps;

        const mapRef = this.refs.map;
        const node = ReactDOM.findDOMNode(mapRef);
        const curr = this.state.currentLocation;
        let center = new maps.LatLng(curr.lat, curr.lng)

        let mapConfig = Object.assign({}, {
          center,
          zoom: this.props.zoom
        });

        this.map = new maps.Map(node, mapConfig);

        evtNames.forEach(e => {
          this.listeners[e] = this.map.addListener(e, this.handleEvent(e));
        });
        maps.event.trigger(this.map, 'ready');
        this.forceUpdate();
      }
    }

    handleEvent(evtName) {
      let timeout;
      const handlerName = `on${camelize(evtName)}`

      return (e) => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        timeout = setTimeout(() => {
          if (this.props[handlerName]) {
            this.props[handlerName](this.props, this.map, e);
          }
        }, 0);
      }
    }

    recenterMap() {
        const map = this.map;

        const {google} = this.props;
        const maps = google.maps;

        if (!google) return;

        if (map) {
          let center = this.state.currentLocation;
          if (!(center instanceof google.maps.LatLng)) {
            center = new google.maps.LatLng(center.lat, center.lng);
          }
          // map.panTo(center)
          map.setCenter(center);
          maps.event.trigger(map, 'recenter')
        }
    }

    directionsMap(userSelection){
      const map = this.map;

      const {google} = this.props;
      const maps = google.maps;

      console.log(this.state.currentLocation);
      console.log(this.state.initialCategories);
      console.log(this.state.currentCategory);
      console.log(this.state.currentCounters);

      if (!this.state.currentCategory && counter<this.state.initialCategories.length) {

        // if this is an initial load on a new address (due to counter being 0) (but not an initial load of the site (directionsRendererArray is filled)), clean routes
        if(counter === 0 && directionsRendererArray) {
          for(var i=0; i<Object.keys(directionsRendererArray).length; i++) {
            directionsRendererArray[Object.keys(directionsRendererArray)[i]].setMap(null);
          }
        }

        var directionsRenderer = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
          draggable: true,
          map: map,
          polylineOptions: new google.maps.Polyline({strokeColor: rainbow(Math.round(Math.random() * 100),Math.round(Math.random() * 9)),
          })});

        directionsRendererArray[this.state.initialCategories[counter]]=directionsRenderer;
        directionsRendererArray[this.state.initialCategories[counter]].setMap(map);
        directionsRendererArray[this.state.initialCategories[counter]].setDirections(this.state.currentDirections);
        //use counter and Counters to select the poi object thats being routed
        var routedPoi = this.state.currentPoiObject[this.state.initialCategories[counter]][this.state.currentCounters[this.state.initialCategories[counter]]]
        // create a marker for current POI and category
        this.createMarker(routedPoi, this.state.initialCategories[counter]);
        //calc distance and time to the POI from the center address
        var origin_lat = this.state.currentLocation.lat();
        var origin_lng = this.state.currentLocation.lng();
        var latitude = routedPoi.geometry.location.lat();
        var longitude = routedPoi.geometry.location.lng();
        distances[this.state.initialCategories[counter]] = this.calcDistance(origin_lat,origin_lng,latitude,longitude);
        //calc travel time to the POI
        distances[this.state.initialCategories[counter]+"TravelTime"]= this.computetime(directionsRendererArray[this.state.initialCategories[counter]].directions)
        //export distances object to MainMap component for rendering on the SidePanel component
        this.props.exportObject(distances)
        /////////////////////////////////////////////////////////////////
        counter += 1
        if (counter === this.state.initialCategories.length){
          counter = 0
        }
        // On clicks of +/- arrows next to each category
      } else {
        //clear previous renderer
        directionsRendererArray[this.state.currentCategory].setMap(null);
        //pass renderer to map
        directionsRendererArray[this.state.currentCategory].setMap(map);
        //pass options with results, start and end to the renderer on the map
        directionsRendererArray[this.state.currentCategory].setDirections(this.state.currentDirections);
        //set marker and info window
        routedPoi = this.state.currentPoiObject[this.state.currentCategory][this.state.currentCounters[this.state.currentCategory]]
        this.createMarker(routedPoi, this.state.currentCategory);
        //calc distance and time to the POI from the center address
        var origin_lat = this.state.currentLocation.lat();
        var origin_lng = this.state.currentLocation.lng();
        var latitude = routedPoi.geometry.location.lat();
        var longitude = routedPoi.geometry.location.lng();
        distances[this.state.currentCategory] = this.calcDistance(origin_lat,origin_lng,latitude,longitude);
        //calc travel time to the POI
        distances[this.state.currentCategory+"TravelTime"]= this.computetime(directionsRendererArray[this.state.currentCategory].directions)
        //export distances object to MainMap component for rendering on the SidePanel component
        this.props.exportObject(distances)
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
        switch(i % 10){
            case 0: r = 1, g = f, b = 0; break;
            case 1: r = q, g = 1, b = 0; break;
            case 2: r = 0, g = 1, b = f; break;
            case 3: r = 0, g = q, b = 1; break;
            case 4: r = f, g = 0, b = 1; break;
            case 5: r = 1, g = 0, b = q; break;
        }
        var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
        return (c);
        }
        pastCounters = this.state.currentCounters

      }

    restyleMap() {
      if (this.map) {
        const {google} = this.props;
        google.maps.event.trigger(this.map, 'resize');
      }
    }

    renderChildren() {
      const {children} = this.props;

      if (!children) return;

      return React.Children.map(children, c => {
        return React.cloneElement(c, {
          map: this.map,
          google: this.props.google,
          mapCenter: this.state.currentLocation
        });
      })
    }

    createMarker(place, category) {
    const map = this.map;
    const {google} = this.props;
    const maps = google.maps;

    if (place === "undefined" || place === undefined){
      return;
    } else {
      // Marker settings
      var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        visible: false
        });
      //
      if(markerObject[category]){
        markerObject[category].setMap(null);
      }
      //
      markerObject[category]=marker;
      // Info Window Settings
      infowindow = new google.maps.InfoWindow();
      infoWindowObject[category]=infowindow;
      infoWindowObject[category].setContent(place.name);
      infoWindowObject[category].open(map, markerObject[category]);
      }
    }

    calcDistance (fromLat, fromLng, toLat, toLng) {
      return google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(fromLat, fromLng), new google.maps.LatLng(toLat, toLng));
    }

    computetime(result) {
      var time=0;
      var mytravelroute=result.routes[0];
      for (var i = 0; i < mytravelroute.legs.length; i++) {
        time += mytravelroute.legs[i].duration.value;
      }
      var totalSec = time;
      var hours = parseInt( totalSec / 3600 );
      var minutes = parseInt( totalSec / 60 ) % 60;
      var seconds = totalSec % 60;
      var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
      return result
    }

    render() {
      const style = Object.assign({}, mapStyles.map, this.props.style, {
        display: this.props.visible ? 'inherit' : 'none'
      });

      const containerStyles = Object.assign({},
        mapStyles.container, this.props.containerStyle)

      return (
        <div style={containerStyles} className={this.props.className}>
          <div style={style} ref='map'>
            Loading map...
          </div>
          {this.renderChildren()}
        </div>
      )
    }
};

Map.propTypes = {
  google: T.object,
  zoom: T.number,
  centerAroundCurrentLocation: T.bool,
  center: T.object,
  initialCenter: T.object,
  className: T.string,
  style: T.object,
  containerStyle: T.object,
  visible: T.bool
}

evtNames.forEach(e => Map.propTypes[camelize(e)] = T.func)

Map.defaultProps = {
  zoom: 14,
  initialCenter: {
    lat: 37.774929,
    lng: -122.419416
  },
  center: {},
  centerAroundCurrentLocation: false,
  style: {},
  containerStyle: {},
  visible: true
}

export default Map;
