import React from 'react'
import ReactDOM from 'react-dom'
import styles from '../MainMap/styles.module.css';
//counter for the position of the returned POI data list under each of the categories selected...each digit in this array represents a separate counter for a category
var cumulativeTime = 0;
var cumulativeTimeObject={};
var formattedTime;
var poisInformation = {};
///////////////////////////////////////////////////////
const SidePanel=React.createClass({
  ///////////////////////////////////////////////////////
  componentDidUpdate(prevProps) {
      const {google, map, poiObject, distancesObject, userSelection} = this.props;
      if (poiObject !== prevProps.poiObject && distancesObject!== prevProps.distancesObject) {
        this.poiManagerReRender();
      }
  },
  ///////////////////////////////////////////////////////
  poiManagerReRender: function() {
    console.log("rerenderer");
    console.log(this.props.counters);
    for (var i=0; i<this.props.userSelectionWords.length; i++){
      this.poiManager(this.props.userSelection[i]);
    }
  },
  ///////////////////////////////////////////////////////
  handlePlusArrow: function(category) {
    if(this.props.counters[category]<this.props.poiObject[[category]].length-1){
      this.props.counters[category] += 1
    }
    this.poiManager(category);
    this.props.onClick(this.props.counters, category);
  },
  ///////////////////////////////////////////////////////
  handleMinusArrow: function(category) {
    if(this.props.counters[category]>0){
      this.props.counters[category] -= 1
    }
    this.poiManager(category);
    this.props.onClick(this.props.counters, category);
  },
  ///////////////////////////////////////////////////////
  poiManager: function(category) {
    //manages user controlled scrolling of POI data under each category (which are controlled by the checkbox)
    const aref = this.refs[[category]];
    const node = ReactDOM.findDOMNode(aref);
    const divID = "resultsDiv"
    const divToRemove = document.getElementById(divID)
    //create a new section which will contain the POI result for that category
    var section = document.createElement('section');
    section.innerHTML = this.props.poiObject[[category]][this.props.counters[[category]]].name
    console.log(this.props.distancesObject);
    console.log(this.props.userSelectionWords);
    if (this.props.distancesObject && Object.keys(this.props.distancesObject).length / 2 === this.props.userSelectionWords.length){
      cumulativeTime = 0;
      //make sure cumulative time object doesn't have extra categories
      if (Object.keys(cumulativeTimeObject).length>this.props.userSelection.length){
        for (var i=0; i<Object.keys(cumulativeTimeObject).length; i+=2){
          if (this.props.userSelection.indexOf(Object.keys(cumulativeTimeObject)[i])==-1){
            delete cumulativeTimeObject[Object.keys(cumulativeTimeObject)[i]]
          }
        }
      }
      //
      var p1 = document.createElement('p');
      // p.innerHTML = this.props.distancesObject[[i]]
      p1.innerHTML = this.props.distancesObject[[category]+"TravelTime"]
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.log(p1.innerHTML);
      // section.appendChild(p)
      section.appendChild(p1)
      // record info into an object that will be saved in the DB along with other info for this address
      poisInformation[category] = [this.props.poiObject[[category]][this.props.counters[[category]]].name, this.props.distancesObject[[category]+"TravelTime"]]
      //calculate total travel time for the address
      cumulativeTimeObject[category] = timestrToSec(this.props.distancesObject[[category]+"TravelTime"])
      console.log(cumulativeTimeObject);

      for (var i=0; i<Object.keys(cumulativeTimeObject).length; i++){
        console.log(i);
        cumulativeTime += cumulativeTimeObject[Object.keys(cumulativeTimeObject)[i]]
      }
      formattedTime = formatTime(cumulativeTime)
      //Functions for time calcs
      //time to seconds
      function timestrToSec(timestr) {
        var parts = timestr.split(":");
        return (parts[0] * 3600) +
               (parts[1] * 60) +
               (+parts[2]);
      }
      // check if seconds are over 10
      function pad(num) {
        if(num < 10) {
          return "0" + num;
        } else {
          return "" + num;
        }
      }
      // format cumulative seconds back to hour, minute, second format
      function formatTime(seconds) {
        return [pad(Math.floor(seconds/3600)%60),
                pad(Math.floor(seconds/60)%60),
                pad(seconds%60),
                ].join(":");
      }
    }
    //remove old section
    if(node.childNodes[2]){
      node.removeChild(node.childNodes[2])
    }
    //append new section
    node.appendChild(section)
  },
  ///////////////////////////////////////////////////////
  renderTime: function() {
    this.props.renderTime()
  },
  //do a POST request////////////////////////////////////
  requestPOST: function() {
    var url = "/save";
    var data = {};
    var userID=JSON.parse(localStorage.profile).global_client_id;
    data = JSON.stringify({
      userID: userID,
      location: this.props.place,
      totalTime: formattedTime,
      poi: poisInformation
    })
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    //Set header, make sure has application/json, for JSON format, also must JSON.stringify the data before sending
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(data);
    //retrieve data from DB
    // var xhr = new XMLHttpRequest();
    // xhr.open("GET", "/retrieve", true);
    // xhr.send();
  },
  //do a POST request - to save the user's commute//////////////////////////////////
  saveCommutePOST: function(e) {
    if (e.key === 'Enter') {



    // var url = "/saveCommute";
    // var data = {};
    // var userID=JSON.parse(localStorage.profile).global_client_id;
    // data = JSON.stringify({
    //   userCommute: userCommute
    // })
    // var xhr = new XMLHttpRequest();
    // xhr.open("POST", url, true);
    // //Set header, make sure has application/json, for JSON format, also must JSON.stringify the data before sending
    // xhr.setRequestHeader("Content-type", "application/json");
    // xhr.send(data);

      console.log(e.target.value);
    }
  },
  ///////////////////////////////////////////////////////
  render: function() {
    var poiRender=[];
    var totalTime=[];
    var commuteInput=[];
    console.log(JSON.parse(localStorage.profile).global_client_id);

      ///////////////////////////////////////////////////////
      Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
      };
      // Get the size of an object
      var size = Object.size(this.props.counters);

    //create a POI Render object which will have divs of category headings (controlled by checkboxes) and related content as children
    for (var i=0; i<this.props.userSelectionWords.length; i++){
        poiRender.push(
          <div id={this.props.userSelectionWords[i]} key={i} className={styles.poiCategory} ref={this.props.userSelection[i]}>
            <div className={styles.categoryContainer}>{this.props.userSelectionWords[i]}</div>
              <div className={styles.buttonContainer}>
                <div className={styles.plus} onClick={this.handlePlusArrow.bind(this, this.props.userSelection[i])}>+</div>
                <div className={styles.minus} onClick={this.handleMinusArrow.bind(this, this.props.userSelection[i])}>-</div>
              </div>
          </div>)
      }

      if(cumulativeTime === 0){
        totalTime.push(<div></div>)
      } else {
        totalTime.push(
          <div className={styles.totalTime}>
            <div>
              Total Travel Time: {formattedTime}
            </div>
            <div>
              <button onClick={this.requestPOST}>Save Results!</button>
            </div>
          </div>
        )
        commuteInput.push(
            <div>
              <input className={styles.commuteInput} onKeyPress={this.saveCommutePOST} placeholder='Tell us where you commute to!' />
            </div>
        )
      }

    ///////////////////////////////////////////////////////
    if (this.props.poiObject) {
      var sidePanel =
        <div className={styles.left}>
        {poiRender}
        {totalTime}
        {commuteInput}
        </div>;
    } else {
      var sidePanel = "";
    }
    ///////////////////////////////////////////////////////
    return (
      <div>
      {sidePanel}
      </div>
    )
  }
})

export default SidePanel
