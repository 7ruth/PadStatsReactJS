import React, {PropTypes as T} from 'react'
import ReactDOM from 'react-dom'
import {Link} from 'react-router'
import Header from './components/Header/Header'
import {searchNearby} from '../src/lib/placeshelper.js'
import Map, {Marker} from '../src/index'
import { Jumbotron } from 'react-bootstrap'
import AuthService from './utils/AuthService'
import {Button} from 'react-bootstrap'
import styles from './styles.module.css'
///////////////////////////////////////////////////////
let GoogleApiWrapper;
console.log("?????????????????");
console.log(__IS_DEV__);
if (__IS_DEV__) {
  GoogleApiWrapper = require('../src/index').GoogleApiWrapper
} else {
  GoogleApiWrapper = require('../dist').GoogleApiWrapper
}
///////////////////////////////////////////////////////
export const Container = React.createClass({
  propTypes: {
    children: T.element.isRequired,
    auth: T.instanceOf(AuthService)
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
      profile: this.props.route.auth.getProfile()
    }
  },
  ///////////////////////////////////////////////////////
  componentDidUpdate(prevProps) {
      profile: this.props.route.auth.getProfile()
  },
  logout() {
    this.props.route.auth.logout()
    this.context.router.push('/about');
  },
  ///////////////////////////////////////////////////////
  renderChildren: function() {

    const {children} = this.props;
    if (!children) return;
    const sharedProps = {
      google: this.props.google,
      loaded: this.props.loaded,
      auth: this.props.route.auth
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
        <div className={styles.topbar}>
          {this.props.route.auth.loggedIn() ? (
            [
              <Link className={styles.topbarItem} to="/">PadStats</Link>,
              <Link className={styles.topbarItem} to="/Header">Search</Link>,
              <Link className={styles.topbarItem} to="/Home">My Searches</Link>,
              <a className={styles.topbarItem} onClick={this.logout.bind(this)}>Logout</a>
            ]
          ) : (
            [
              <Link className={styles.topbarItemRight} to="/">PadStats</Link>,
              <a className={styles.topbarItemLeft} onClick={this.props.route.auth.login.bind(this)}>Login/Register</a>
            ]
          )}

          </div>
          {/*  Create log in buttons and button for main map. */}
          <div className={styles.wrapper}>
            <div id="content" className={styles.content}>
            {/*    <Header />*/}
            <Map google={google}
                  className={'map'}
                  visible={false}>
              {c}
              </Map>

            </div>
          </div>
        </div>
    )
  }
})

export default GoogleApiWrapper({
  apiKey: process.env.GAPI_KEY
})(Container)
