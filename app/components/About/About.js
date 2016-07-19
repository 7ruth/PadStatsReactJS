import React from 'react'
import {Link} from 'react-router'
///////////////////////////////////////////////////////
const About = React.createClass({
  render: function() {
    return(<div>

      <h1>PadStats</h1>
      <h2>informal, a persons home.</h2>
      <h2>noun, the practice or science of collecting and analyzing numerical data in large quantities, especially for the purpose of inferring proportions in a whole from those in a representative sample.</h2>
      <br />
      <h1>About</h1>


      <Link to="/MainMap">Find A Perfect Home</Link>

      </div>
    )
  }
})

export default About
