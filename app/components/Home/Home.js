import React, { PropTypes as T } from 'react'
import ReactDOM from 'react-dom'
import {Button} from 'react-bootstrap'
import AuthService from '../../utils/AuthService'
import ProfileDetails from '../../utils/Profile/ProfileDetails'
import ProfileEdit from '../../utils/Profile/ProfileEdit'
import styles from './styles.module.css'
import $ from 'jquery'
import MyFirstGrid from '../ProfileTable/ProfileTable.js'

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

  componentDidMount() {
    var userID=JSON.parse(localStorage.profile).global_client_id;
    var url = "/retrieve/"+userID;
    console.log(url);
    this.serverRequest = $.get(url, function (result) {
      console.log(result);
      this.setState({
        userMongoProfile: result
      });
    }.bind(this));
  }

  getState(){
    console.log(this.state);
  }

  logout(){
    this.props.auth.logout()
    this.context.router.push('/about');
  }

  render(){
    var layouts = MyFirstGrid;

    console.log(this.props.auth.getProfile());
    console.log(this.state.userMongoProfile);
    const { profile } = this.state

    if (this.state.userMongoProfile) {
    var searchedAddressList = this.state.userMongoProfile.map(function(obj){

        return <li>{obj.location.formatted_address} {obj.location.poi}</li>;
      })
    }

    return (
      <div className={styles.root}>

      <MyFirstGrid className={styles.grid} userMongoProfile = {this.state.userMongoProfile} />

      </div>
    )
  }
}

export default Home;

// <h2>Home</h2>
// <ProfileDetails profile={profile}></ProfileDetails>
// <ProfileEdit profile={profile} auth={this.props.auth}></ProfileEdit>
// <Button onClick={this.logout.bind(this)}>Logout</Button>
// <Button onClick={this.getState.bind(this)}>GetState</Button>
// <ul>{ searchedAddressList }</ul>
// <div ref= "hi">
//   <div> hi</div>
//   <div> bye</div>
// </div>
