import React from 'react';
import ReactDOM from 'react-dom';
import styles from './styles.module.css';
import {Responsive, WidthProvider} from 'react-grid-layout';
import _ from 'lodash';
import NumericInput from 'react-numeric-input';

const ResponsiveReactGridLayout = WidthProvider(Responsive);
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var ReactGridLayout = require('react-grid-layout');
const Grid = ReactGridLayout.WidthProvider(ReactGridLayout);
//Component Variables///////////////////////////////////////////////////////////////////
var tempLayout;
var elementHTMLTemplate= [];
var width;
var placeTypesKey = {
  'convenience_store':'Convenience Store',
  'gym':'Gym',
  'grocery_or_supermarket':'Grocery Store',
  'school':'School',
  'library':'Library',
  'museum':'Museum'
}
var counterNumber;
var categoryCounters={};

var MyFirstGrid = React.createClass({
///////////////////////////////////////////////////////
  onLayoutChange(layout){
      tempLayout = layout;
  },
///////////////////////////////////////////////////////
  getInitialState(){
    return( {
      layouts: [],
      collapsedWidgets: {},
      isDraggable: true,
      isResizable: true,
      rowHeight: 1,
      cols: 1,
      clickedID: null
    })
  },
///////////////////////////////////////////////////////
  toggleEl(id) {
    return () => {
      const newState = {...this.state.collapsedWidgets};
      const collapsed = typeof newState[id] === 'boolean' ? newState[id] : false;
      newState[id] = !collapsed;
      this.setState({
        collapsedWidgets: newState,
        clickedID: id
      });
    }
  },
///////////////////////////////////////////////////////
  getModifiedLayouts() {
      const { clickedID, collapsedWidgets } = this.state;
      if (Object.keys(collapsedWidgets).length === 0 && collapsedWidgets.constructor === Object) {
          var layouts = this.state.layouts;
      } else {
          var layouts = tempLayout;
      }

      const newLayouts = layouts.map(layout => {
          const newLayout = { ...layout };
          if (newLayout.i == clickedID) {
            if (newLayout.h==1) {
              newLayout.h = 3;
            } else {
              newLayout.h = 1;
            }
          }
          return newLayout;
      });

      return newLayouts;
  },
///////////////////////////////////////////////////////
    componentDidUpdate(prevProps) {
      //check it new state userMongoProfile is different from last state's, then update
      if (this.props.userMongoProfile !== prevProps.userMongoProfile) {
        //create category counters, which will be saved as main user preference
        this.props.userMongoProfile.forEach(function(i, key, list) {
          Object.keys(i.poi).forEach(function(item){
            if(elementHTMLTemplate.indexOf(item)=='-1'){
              elementHTMLTemplate.push(item);
            }
          });
          elementHTMLTemplate.forEach(function(el){
            categoryCounters[el]=1;
          })
        })

        this.setState({
          addressDetailElementsData: this.props.userMongoProfile.map(function(i, key, list) {
            return (
              {
                i: i._id,
                formatted_address: i.location.formatted_address,
                poi: i.poi,
                totalTime: i.totalTime
              }
            )
          }),
          categoryCounters: categoryCounters,
          layouts: this.props.userMongoProfile.map(function(i, index) {
            return (
              {
                i: i._id,
                x: 0,
                y: index+1,
                w: 12,
                h: 1,
              }
            )
          }),
          collapsedWidgets: {}
        });
      }
    },
///////////////////////////////////////////////////////
  computeTime(time) {
    var totalSec = time;
    var hours = parseInt( totalSec / 3600 );
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;
    var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    return result
  },
///////////////////////////////////////////////////////
    generateElements() {
      var columnCountArray=[];
      if (this.state.addressDetailElementsData){
        //Start creating element content based on # columns determined by # of categories present
        return this.state.addressDetailElementsData.map((el, index) => {
          var content = [];
          var totalSeconds = 0;
          // next line has a +2 to account for formatted address and total time columns which will be added to whatever categories are also part of the analysis
          width = (100/(Object.keys(this.state.categoryCounters).length+2)).toString().concat('%');

          // get the searched address into content
          content.push(
            <div className={styles.content+ ' ' +styles.elementHeader} style={{ width: width }}>{el.formatted_address}</div>
          )
          Object.keys(this.state.categoryCounters).forEach(function(category){
            //if category is missing from that specific element... just insert a blank div (it will be later grayed out to make it clear what addresses can be compared on apple to apple basis)
            if (el.poi[category]) {
              // Multiply POI travel time by the number of time's user visit that POI
              var timeArray = el.poi[category][1].split(':')
              var seconds = parseInt(timeArray[0]*60*60)+parseInt(timeArray[1]*60)+parseInt(timeArray[2])
              var newSeconds = seconds * this.state.categoryCounters[category];
              totalSeconds +=newSeconds;
              var newTime = this.computeTime(newSeconds);

              content.push(
                <div className={styles.content} style={{ width: width }}>
                  <div className={styles.categoryName}>{el.poi[category][0]}</div>
                  <div className={styles.categoryTime}>{newTime}</div>
                </div>
              )
            } else {
              content.push(
                <div className={styles.content} style={{ width: width }}> *Blank*</div>
              )
            }
          }, this)
          //also add total time as the last div in the content
console.log(totalSeconds);
          content.push(
            <div className={styles.content} style={{ width: width }}>
              <div>{this.computeTime(totalSeconds)}</div>
            </div>
          )

          return (
            <div key={el.i} className = {styles.addressDetailElement} onClick={this.toggleEl(el.i).bind(this)}>
                <div className={styles.componentContent} >
                  {content}
                </div>
              <span className={styles.remove} onClick={this.onRemoveItem.bind(this, el.i)}>x</span>
            </div>
          );
        });
      }
    },
///////////////////////////////////////////////////////
    handleCounterChange(a) {
      if(isNaN(a)){
        categoryCounters[a]=counterNumber
        console.log(categoryCounters);
        this.setState({
          categoryCounters:categoryCounters,
          clickedID: null
        })
      } else {
        counterNumber = a;
        console.log(a);
      }
    },
///////////////////////////////////////////////////////
    generateTable() {

      var elements = this.generateElements();
      // create table header with logic to adjust travel times
      if(elements){
        var tableHeaderCategories=[<div className={styles.tableHeaderElements} style={{ width: width }}></div>];
        // loop to create header category divs and counters
        Object.keys(this.state.categoryCounters).forEach(function(el){
          tableHeaderCategories.push(
            <div className={styles.tableHeaderElements} style={{ width: width}}>
              <div className={styles.tableHeaderElementCategory}> {placeTypesKey[el]} </div>
              <div className={styles.tableHeaderElementCounter} onClick={()=>{this.handleCounterChange(el)}}>
                <NumericInput
                  className={styles.tableHeaderElementCounterWidget}
                  min={0}
                  max={100}
                  value={this.state.categoryCounters[el]}
                  mobile
                  onChange={this.handleCounterChange}
                />
              </div>
            </div>)
        }, this)
        tableHeaderCategories.push(<div className={styles.tableHeaderElements} style={{ width: width }}></div>)

        elements.push(<div className={styles.tableHeader} key="a" _grid={{x: 0, y: 0, w: 12, h: .66, static: true}}>
          {tableHeaderCategories}
        </div>);

        return (elements);
      };
    },
///////////////////////////////////////////////////////
    onRemoveItem(i) {
      var url = "/delete";
      var data = {};
      var userID=JSON.parse(localStorage.profile).global_client_id;
      data = JSON.stringify({
        i: i,
      })
      var xhr = new XMLHttpRequest();
      xhr.open("DELETE", url, true);
      //Set header, make sure has application/json, for JSON format, also must JSON.stringify the data before sending
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send(data);
      this.setState({addressDetailElementsData: _.reject(this.state.addressDetailElementsData, {i: i})});
    },
///////////////////////////////////////////////////////
    render() {
      var elements = this.generateTable();
      const modifiedLayouts = this.getModifiedLayouts();

      return (<div style={{ marginTop: '0px' }}>
              {elements ?
                <Grid className={styles.grid}
                  {...this.props}
                  layout={modifiedLayouts}
                  onLayoutChange={this.onLayoutChange}>
                    {elements}
                </Grid> : null}
              </div>);
    }
});

export default MyFirstGrid;
