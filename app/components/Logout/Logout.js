import React from 'react'
import auth from '../../../src/auth.js'

const Logout = React.createClass({
  componentDidMount() {
    auth.logout()
  },

  render() {
    return <p>You are now logged out</p>
  }
})

export default Logout
