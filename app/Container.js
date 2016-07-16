import React, {PropTypes as T} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router'
import Header from './components/Header/Header'
import {searchNearby} from '../src/lib/placeshelper.js'
import Map, {Marker} from '../src/index'
import auth from '../src/auth'
///////////////////////////////////////////////////////
let GoogleApiWrapper;
if (__IS_DEV__) {
  GoogleApiWrapper = require('../src/index').GoogleApiWrapper
} else {
  GoogleApiWrapper = require('../dist').GoogleApiWrapper
}
///////////////////////////////////////////////////////
import styles from './styles.module.css'
///////////////////////////////////////////////////////
export const Container = React.createClass({
  propTypes: {
    children: T.element.isRequired
  },
  ///////////////////////////////////////////////////////
  contextTypes: {
    router: T.object
  },
  ///////////////////////////////////////////////////////
  getInitialState() {
    return {
      places: [],
      pagination: null,
      loggedIn: auth.loggedIn()
    }
  },
  ///////////////////////////////////////////////////////
  updateAuth(loggedIn) {
    this.setState({
      loggedIn: !!loggedIn
    })
  },
  ///////////////////////////////////////////////////////
  componentWillMount() {
    auth.onChange = this.updateAuth
    auth.login()
  },
  ///////////////////////////////////////////////////////
  renderChildren: function() {
    const {children} = this.props;
    if (!children) return;
    const sharedProps = {
      google: this.props.google,
      loaded: this.props.loaded
    }
    return React.Children.map(children, c => {
      return React.cloneElement(c, sharedProps, {
      });
    })
  },
  ///////////////////////////////////////////////////////
  render: function() {
    const {routeMap, routeDef} = this.props;
    const {router} = this.context;
    const props = this.props;
    const c = this.renderChildren();
    return (
      <div className={styles.container}>
        <div className={styles.topMenu}>
          {this.state.loggedIn ? (
            <Link to="/Logout">Log out</Link>
          ) : (
            <Link to="/Login">Sign in</Link>
          )}
          <Link to="/"><h1>PadStats</h1></Link>
          <Link to="/MainMap"><h1>Find Perfect Home</h1></Link>
          <Link to="/MainMap"><h1>Register</h1></Link>
          {/*  Create log in buttons and button for main map. */}
          <div className={styles.wrapper}>
            <div className={styles.content}>
                {c}
          {/*   <Map google={google}
                className={'map'}
                visible={false}>
              <Header />
            </Map>  */}

            </div>
          </div>
        </div>
      </div>
    )
  }
})

export default GoogleApiWrapper({
  apiKey: __GAPI_KEY__
})(Container)
