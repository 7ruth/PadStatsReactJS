import React from 'react'
import ReactDOM from 'react-dom'
import styles from '../MainMap/styles.module.css';

//counter for the position of the returned POI data list under each of the categories selected...each digit in this array represents a separate counter for a category
var counters={};

const SidePanel=React.createClass({
  ///////////////////////////////////////////////////////
  componentDidUpdate(prevProps) {
      for (var i=0; i<this.props.userSelectionWords.length; i++){
        this.poiManager(this.props.userSelection[i]);
      }
  },
  ///////////////////////////////////////////////////////
  handlePlusArrow: function(i) {
    if(counters[i]<this.props.poiObject[[i]].length-1){
      counters[i] += 1
    }
    this.poiManager(i);
    this.props.onClick(counters);
  },
  ///////////////////////////////////////////////////////
  handleMinusArrow: function(i) {
    if(counters[i]>0){
      counters[i] -= 1
    }
    this.poiManager(i);
    this.props.onClick(counters);
  },
  ///////////////////////////////////////////////////////
  poiManager: function(i) {
    //manages user controlled scrolling of POI data under each category (which are controlled by the checkbox)
    const aref = this.refs[[i]];
    const node = ReactDOM.findDOMNode(aref);
    const divID = "resultsDiv"
    const divToRemove = document.getElementById(divID)
    //create a new p which will contain the POI result for that category
    var p = document.createElement('p');
    p.innerHTML = this.props.poiObject[[i]][counters[[i]]].name
    //remove old p
    if(node.childNodes[2]){
      node.removeChild(node.childNodes[2])
    }
    //append new p
    node.appendChild(p)
  },

  render: function() {
    var poiRender=[];
    //if the object with all POI data is delivered
    if (this.props.poiObject) {
      //if counter for a category doesnt exist, create it
      for (var i=0; i<this.props.userSelection.length; i++){
        if (!counters[this.props.userSelection[i]]){
        counters[this.props.userSelection[i]]=0
        }
      }
      // see if old counters array has anything extra that doesnt match userSelection array key
      function keyExists(key, search) {
          if (!search || (search.constructor !== Array && search.constructor !== Object)) {
              return false;
          }
          for (var i = 0; i < search.length; i++) {
              if (search[i] === key) {
                  return true;
              }
          }
          if (key in search){
          } else {
            delete counters[key]
          }
      }
      ///
      Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
      };
      // Get the size of an object
      var size = Object.size(counters);
      for (var i=0; i<size-1; i++){
        keyExists(Object.keys(counters)[i], this.props.userSelection)
      }
      ///
    //create a POI Render object which will have divs of category headings (controlled by checkboxes) and related content as children
    for (var i=0; i<this.props.userSelectionWords.length; i++)
      {
        ///

        poiRender.push(
          <div id={this.props.userSelectionWords[i]} key={i} className={styles.poiCategory} ref={this.props.userSelection[i]} >
            <div className={styles.categoryContainer}>{this.props.userSelectionWords[i]}</div>
              <div className={styles.buttonContainer}>
                <div className={styles.plus} onClick={this.handlePlusArrow.bind(this, this.props.userSelection[i])}>+</div>
                <div className={styles.minus} onClick={this.handleMinusArrow.bind(this, this.props.userSelection[i])}>-</div>
              </div>
          </div>)
      }
    }

    if (this.props.poiObject) {
      var sidePanel =
        <div className={styles.left}>
        {poiRender}
        </div>;
    } else {
      var sidePanel = "";
    }

    return (
      <div>
      {sidePanel}
      </div>
    )
  }
})

export default SidePanel
