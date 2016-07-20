import React from 'react'
import {Link} from 'react-router'
import styles from './styles.module.css'
///////////////////////////////////////////////////////
const About = React.createClass({
  render: function() {
    return(
      <div>
        <div className={styles.mainContainer}>
          <div className={styles.mainTitle}>PadStats</div>
          <div className={styles.mainText}>We help you compare your home options to identify the most time saving (convinient) property.</div>
          <div className={styles.subText}>Try our service by searching an address below. </div>
          <div className={styles.search}><Link to="/MainMap">Find A Perfect Home</Link> </div>
        </div>
      </div>

    )
  }
})

export default About
