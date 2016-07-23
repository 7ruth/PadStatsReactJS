import React, { PropTypes as T } from 'react'
import {Button} from 'react-bootstrap'
import AuthService from '../../utils/AuthService'
import ProfileDetails from '../../utils/Profile/ProfileDetails'
import ProfileEdit from '../../utils/Profile/ProfileEdit'
import styles from './styles.module.css'
import $ from 'jquery';

export class Home extends React.Component {
  static contextTypes = {
    router: T.object
  }

  static propTypes = {
    auth: T.instanceOf(AuthService)
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      profile: props.auth.getProfile()
    }
    props.auth.on('profile_updated', (newProfile) => {
      this.setState({profile: newProfile})
    })
  }

  requestGET() {
    var url = "/retrieve";
    var data = {};
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    //Set header, make sure has application/json, for JSON format, also must JSON.stringify the data before sending
    xhr.send(null);
    //retrieve data from DB
    // var xhr = new XMLHttpRequest();
    // xhr.open("GET", "/retrieve", true);
    // xhr.send();
  }

  componentDidMount() {
    this.serverRequest = $.get("/retrieve", function (result) {
      console.log("hiiiiiii");
      // var lastGist = result[0];
      // this.setState({
      //   username: lastGist.owner.login,
      //   lastGistUrl: lastGist.html_url
      // });
    }.bind(this));
  }

 httpGetAsync(theUrl) {
   var xmlHttp = new XMLHttpRequest();
   xmlHttp.onreadystatechange = function() {
     if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
       console.log(xmlHttp.responseText)
     }
   }
   xmlHttp.open("GET", theUrl, true);
   xmlHttp.send(null);
}

  logout(){
    this.props.auth.logout()
    this.context.router.push('/about');
  }

  render(){
    this.httpGetAsync("/retrieve");
    this.requestGET();
    console.log(this.props.auth.getProfile());
    const { profile } = this.state
    return (
      <div className={styles.root}>
        <h2>Home</h2>
        <ProfileDetails profile={profile}></ProfileDetails>
        <ProfileEdit profile={profile} auth={this.props.auth}></ProfileEdit>
        <Button onClick={this.logout.bind(this)}>Logout</Button>
        <Button onClick={this.requestGET}>Get</Button>
      </div>
    )
  }
}

export default Home;
