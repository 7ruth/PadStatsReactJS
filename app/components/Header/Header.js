import React from 'react'
import ReactDOM from 'react-dom'
import MainMap from '../../components/MainMap/MainMap'
import styles from './styles.module.css';
import {Link} from 'react-router'
import {searchNearby} from '../../../src/lib/placeshelper.js'
import {lookupDirections} from '../../../src/lib/directionshelper.js'
import CheckboxGroup from 'react-checkbox-group';
///////////////////////////////////////////////////////
var placesTypes = [
  'convenience_store',
  'gym',
  'grocery_or_supermarket',
  'school',
  'library',
  'museum'
];
///////////////////////////////////////////////////////
var placeTypesKey = {
  'convenience_store':'Convenience Store',
  'gym':'Gym',
  'grocery_or_supermarket':'Grocery Store',
  'school':'School',
  'library':'Library',
  'museum':'Museum'
}
///////////////////////////////////////////////////////
var userSelection = [placesTypes[0],placesTypes[1],placesTypes[2]];
var userSelectionWords = [placeTypesKey[placesTypes[0]],placeTypesKey[placesTypes[1]],placeTypesKey[placesTypes[2]]];
var counters = {};
var prevCounters = {};
///////////////////////////////////////////////////////
const Header=React.createClass({
  ///////////////////////////////////////////////////////
  getInitialState() {
    return {
      place: null,
      position: null,
      userSelection: userSelection,
      userSelectionWords: userSelectionWords,
      placesTypes: placesTypes
    }
  },
  ///////////////////////////////////////////////////////
  onSubmit: function(e) {
    e.preventDefault();
  },
  ///////////////////////////////////////////////////////
  componentDidMount: function() {
    this.renderAutoComplete();
  },
  ///////////////////////////////////////////////////////
  componentDidUpdate(prevProps) {
    const {google, map} = this.props;
    if (map !== prevProps.map) {
      this.renderAutoComplete();
    }
  },
  ///////////////////////////////////////////////////////
  mapOptionsChanged: function(newSelection) {
    userSelection=[];
    userSelectionWords=[];
    userSelection=newSelection;
    for (var i=0; i<userSelection.length; i++){
      userSelectionWords.push(placeTypesKey[userSelection[i]])
    }
    this.setState({
      userSelection: userSelection,
      userSelectionWords: userSelectionWords
    });
    ///! Implement a way to update routes on checkbox changes... should deal with it here.
    ///! Also a good place to add counters here... and set counters state here also to make sure everything flows
  },
  ///////////////////////////////////////////////////////
  renderAutoComplete: function() {
    const {google, map} = this.props;
    if (!google || !map) return;
    const aref = this.refs.autocomplete;
    const node = ReactDOM.findDOMNode(aref);
    var autocomplete = new google.maps.places.Autocomplete(node);
    autocomplete.bindTo('bounds', map);
    ///////////////////////////////////////////////////////
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        return;
      }
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
      }
      ///////////////////////////////////////////////////////
      this.setState({
        place: place,
        position: place.geometry.location
      })
      ///////////////////////////////////////////////////////
      var poiObject ={};
      ///////////////////////////////////////////////////////
      for (var i=0; i<placesTypes.length; i++){
        const opts = {
          location: map.center,
          radius: '1000',
          types: [placesTypes[i]]
        }
        ///////////////////////////////////////////////////////
        searchNearby(google, map, opts)
          .then((results, pagination) => {
            poiObject[opts.types] = results
            ///////////////////////////////////////////////////////
            if (Object.keys(poiObject).length == placesTypes.length){
              ///////////////////////////////////////////////////////
              this.setState({
                poiObject: poiObject,
                placesTypes: placesTypes,
                pagination
              })
              ///////////////////////////////////////////////////////
              var initialCategories=[];
              for (var i=0; i<userSelection.length; i++){
                if (!counters[userSelection[i]]){
                counters[userSelection[i]]=0
                }
                initialCategories.push(userSelection[i])
              }
              ///////////////////////////////////////////////////////
              this.setState({
                counters: counters,
                initialCategories: initialCategories,
                category: null
              })
              ///////////////////////////////////////////////////////
              for (var i=0; i<userSelection.length; i++){
                this.setDirections(Object.keys(counters)[i]);
              }
              prevCounters = counters;
            }
        })
      }
    })
  },
  ///////////////////////////////////////////////////////
  onClick: function(counters) {
    // figure out which counters category changed
    for(var i=0; i<Object.keys(counters).length; i++){
      if(counters[Object.keys(counters)[i]] !== prevCounters[Object.keys(counters)[i]]){
      var category = Object.keys(counters)[i]
      }
    }
    ///////////////////////////////////////////////////////
    this.setState({
      counters: counters,
      category: category
    })
    ///////////////////////////////////////////////////////
    this.setDirections(category);
  },
  ///////////////////////////////////////////////////////
  setDirections: function(category) {
    const {google, map} = this.props;
    const request = {
      origin: this.state.position,
      destination: this.state.poiObject[category][this.state.counters[category]]['geometry']['location'],
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    }
      lookupDirections(google, map, request, category)
        .then((results, pagination, category) => {
          this.setState({
            directions: results
          })
        });
  },
  ///////////////////////////////////////////////////////
  render: function() {
    const props = this.props;
    const {position} = this.state;
    return (
      <div>
        <div className={styles.topbar}>
          <Link to="/"><h1>PadStats</h1></Link>

          <section>
            <div className={styles.searchbox}>
              <form action="/quotes" method="POST" onSubmit={this.onSubmit}>
                <input
                    ref='autocomplete'
                    type="text"
                    placeholder="Enter a location" />
              </form>
            </div>
            <div className={styles.checkboxdiv}>
              <CheckboxGroup
                name="mapOptions"
                value={this.state.userSelection}
                onChange={this.mapOptionsChanged}
                >
                 {
                   Checkbox => (
                     <form className={styles.checkbox}>
                       <label>
                         <Checkbox value="convenience_store"/> Convenience Store
                       </label>
                       <label>
                         <Checkbox value="gym"/> Gym
                       </label>
                       <label>
                         <Checkbox value="grocery_or_supermarket"/> Grocery
                       </label>
                       <label>
                         <Checkbox value="school"/> School
                       </label>
                       <label>
                         <Checkbox value="library"/> Library
                       </label>
                       <label>
                         <Checkbox value="museum"/> Museum
                       </label>
                     </form>
                   )
                 }
             </CheckboxGroup>
            </div>
          </section>
        </div>
        <div>
          <MainMap {...props}
            directions = {this.state.directions}
            counters = {this.state.counters}
            category = {this.state.category}
            initialCategories = {this.state.initialCategories}
            position= {this.state.position}
            poiObject = {this.state.poiObject}
            placesTypes = {this.state.placesTypes}
            userSelection= {this.state.userSelection}
            userSelectionWords = {this.state.userSelectionWords}
            onClick = {this.onClick} />
        </div>
      </div>
    )
  }
})

export default Header
