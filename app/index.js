import React from 'react'
import ReactDOM from 'react-dom'
import {Router, hashHistory, Redirect, Route, IndexRoute, Link} from 'react-router'

import styles from './global.styles.css';

import Container from './Container'

const routeMap = {
  'mainmap': {
    name: 'MainMap',
    component: require('./components/MainMap/MainMap').default
  },
  'about': {
    name: 'About',
    component: require('./components/About/About').default
  },
  'login': {
    name:'Login',
    component: require('./components/Login/Login').default
  },
  'logout': {
    name:'Logout',
    component: require('./components/Logout/Logout').default
  }
}

const createElement = (Component, props) => {
  const pathname = props.location.pathname.replace('/', '')
  const routeDef = routeMap[pathname];
  const newProps = {
    routeMap, pathname, routeDef
  }
  return <Component {...newProps} {...props} />
}

const routes = (
  <Router createElement={createElement}
          history={hashHistory}>
    <Route component={Container} path='/'>
      {Object.keys(routeMap).map(key => {
        const r = routeMap[key]
        return (<Route
                key={key}
                path={key}
                name={r.name}
                component={r.component} />)
      })}
      <IndexRoute component={routeMap['about'].component} />
    </Route>
  </Router>
)

const mountNode = document.querySelector('#root')
if (mountNode) {
  ReactDOM.render(routes, mountNode);
} else {
  const hljs = require('highlight.js');

  const codes = document.querySelectorAll('pre code');
  for (var i = 0; i < codes.length; i++) {
    const block = codes[i]
    hljs.highlightBlock(block);
  }
}
