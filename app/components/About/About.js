import React from 'react'
import {Link} from 'react-router'
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
import styles from './styles.module.css'
///////////////////////////////////////////////////////
const About = React.createClass({
  render: function() {
    return(
      <div>
        <div className={styles.mainContainer}>
          <div className={styles.mainTitle}>PadStats</div>
          <div className={styles.mainText}>Compare homes to see which one has the most convinient location.</div>
          <div className={styles.subText}>Location, location, location, the eternal mantra of real estate holds true as ever even in our high tech world. We employ latest technologies to help you compare and identify a location that is most conviniently positioned for your lifestyle. Additionally, studies have shown that conviniently located homes retain value better than an average home. </div>
          <ReactCSSTransitionGroup
                    transitionName="example"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={300}>
                    <div className={styles.search}><Link to="/Header">Look up an address!</Link> </div>

                  </ReactCSSTransitionGroup>

          <div className={styles.contact}>Contact</div>
        </div>
      </div>

    )
  }
})

export default About
