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
const directionsRendererArray = [];

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
          currentDirections: this.props.directions,
          currentDirectionsCategory: this.props.directionsCategory
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

      console.log(this.state.currentDirections);
      console.log(this.state.currentDirectionsCategory);
      console.log(userSelection);

      var directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        draggable: true,
        map: map,
        polylineOptions: new google.maps.Polyline({strokeColor: rainbow(Math.round(Math.random() * 100),Math.round(Math.random() * 9)),
        })});

      directionsRendererArray.push(directionsRenderer);

      console.log("*click*")
      console.log(directionsRenderer);

      //pass renderer to map
      directionsRenderer.setMap(map);
      //pass options with results, start and end to the renderer on the map
      directionsRenderer.setDirections(this.state.currentDirections);
      map.setZoom(14);

      function rainbow(numOfSteps, step) {
      // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
      // Adam Cole, 2011-Sept-14
      // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
        var r, g, b;
        var h = step / numOfSteps;
        var i = ~~(h * 6);
        var f = h * 6 - i;
        var q = 1 - f;
        switch(i % 6){
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
