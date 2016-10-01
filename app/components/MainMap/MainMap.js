import React from 'react'
import ReactDOM from 'react-dom'
///////////////////////////////////////////////////////
import Map, {Marker, InfoWindow, GoogleApiWrapper} from '../../../src/index'
import {Link} from 'react-router'
import styles from './styles.module.css';
import {searchNearby} from '../../../src/lib/placeshelper.js'
import SidePanel from '../../components/SidePanel/SidePanel'
///////////////////////////////////////////////////////
const MainMap = React.createClass({
  ///////////////////////////////////////////////////////
  getInitialState() {
    return {
      place: null,
      position: null
    }
  },
  ///////////////////////////////////////////////////////
  componentDidUpdate(prevProps) {
      const {userSelection} = this.props;
      if (userSelection !== prevProps.userSelection){
        this.sidePanelComponent.poiManagerReRender();
      }
  },
  //Gets the +/- click commands data on each category from the SidePanel component to the Header component
  onClick: function(counters, category) {
    this.props.onClick(counters, category)
    console.log(counters);
    console.log(counters);
  },
  //Gets the distance and time travelled to each destination exported from Map component
  exportObject: function(object){
    this.setState({
      distancesObject: object
    })
  this.sidePanelComponent.poiManagerReRender();
  },
  ///////////////////////////////////////////////////////
  render: function() {
    const props = this.props;
    if (this.props.position){
      var sidepanel =
        <div className={styles.left}>
          <SidePanel {...props}
            place = {this.props.place}
            counters = {this.props.counters}
            position = {this.props.position}
            poiObject = {this.props.poiObject}
            placesTypes = {this.props.placesTypes}
            userSelection = {this.props.userSelection}
            userSelectionWords = {this.props.userSelectionWords}
            distancesObject = {this.state.distancesObject}
            ref={(sidePanelComponent) => this.sidePanelComponent = sidePanelComponent}
            onClick = {this.onClick}/>
        </div>;
      } else {
        var sidepanel = <div></div>;
      }
    ///////////////////////////////////////////////////////
    return (
      <div className={styles.flexWrapper}>
        {sidepanel}
        <div className={styles.right}>
          <Map {...props}
              containerStyle={{
                position: 'relative',
                height: 'calc(100vh - 115px)',
                width: '100%'
              }}
              center={this.props.position}
              directions={this.props.directions}
              userSelection = {this.props.userSelection}
              counters = {this.props.counters}
              category = {this.props.category}
              initialCategories = {this.props.initialCategories}
              poiObject = {this.props.poiObject}
              exportObject = {this.exportObject}
              centerAroundCurrentLocation={false}>
                <Marker
                  onClick={this.onMarkerClick}
                  position={this.props.position} />
          </Map>

        </div>
      </div>
    )
  }
})

export default MainMap
