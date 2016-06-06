import React, {PropTypes as T} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router'
import Header from './components/Header/Header'
import {searchNearby} from '../src/lib/placeshelper.js'

import Map, {Marker} from '../src/index'


let GoogleApiWrapper;
if (__IS_DEV__) {
  GoogleApiWrapper = require('../src/index').GoogleApiWrapper
} else {
  GoogleApiWrapper = require('../dist').GoogleApiWrapper
}

import styles from './styles.module.css'

export const Container = React.createClass({

  propTypes: {
    children: T.element.isRequired
  },

  contextTypes: {
    router: T.object
  },
  getInitialState() {
    return {
      places: [],
      pagination: null
    }
  },

  render: function() {
    const {routeMap, routeDef} = this.props;
    const {router} = this.context;
    const props = this.props;

    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.content}>
          <Map google={google}
              className={'map'}
              visible={false}>

          <Header />

          </Map>
          </div>
        </div>
      </div>
    )
  }
})

export default GoogleApiWrapper({
  apiKey: __GAPI_KEY__
})(Container)
