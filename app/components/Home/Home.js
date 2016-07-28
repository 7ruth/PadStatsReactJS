import React, { PropTypes as T } from 'react'
import {Button} from 'react-bootstrap'
import AuthService from '../../utils/AuthService'
import ProfileDetails from '../../utils/Profile/ProfileDetails'
import ProfileEdit from '../../utils/Profile/ProfileEdit'
import styles from './styles.module.css'
import $ from 'jquery'
import ReactDOM from 'react-dom'


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
    $(ReactDOM.findDOMNode(this.refs.hi)).sortable({
      items: 'div',
      update: this.handleSortableUpdate
    });
  }

  getState(){
    console.log(this.state);
  }

  logout(){
    this.props.auth.logout()
    this.context.router.push('/about');
  }

  render(){
    console.log(this.props.auth.getProfile());
    const { profile } = this.state

    if (this.state.userMongoProfile) {
    var searchedAddressList = this.state.userMongoProfile.map(function(obj){

        return <li>{obj.location.formatted_address} {obj.location.poi}</li>;
      })
    }

    return (
      <div className={styles.root}>

        <h2>Home</h2>
        <ProfileDetails profile={profile}></ProfileDetails>
        <ProfileEdit profile={profile} auth={this.props.auth}></ProfileEdit>
        <Button onClick={this.logout.bind(this)}>Logout</Button>
        <Button onClick={this.getState.bind(this)}>GetState</Button>
        <ul>{ searchedAddressList }</ul>
        <div ref= "hi">
          <div> hi</div>
          <div> bye</div>
         </div>
      </div>
    )
  }
}

export default Home;
