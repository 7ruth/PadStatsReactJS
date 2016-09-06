import React from 'react';
import ReactDOM from 'react-dom';
import styles from './styles.module.css';
import {Responsive, WidthProvider} from 'react-grid-layout';
import _ from 'lodash';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var ReactGridLayout = require('react-grid-layout');
const Grid = ReactGridLayout.WidthProvider(ReactGridLayout);
var tempLayout;

var MyFirstGrid = React.createClass({

  onLayoutChange(layout){
      tempLayout = layout;
  },

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

    getModifiedLayouts() {
        const { clickedID, collapsedWidgets } = this.state;
        if (Object.keys(collapsedWidgets).length === 0 && collapsedWidgets.constructor === Object) {
            var layouts = this.state.layouts;
        } else {
            var layouts = tempLayout;
        }

        // console.log(this.state.layout);
        console.log(this.state.collapsedWidgets);
        console.log(collapsedWidgets);
        console.log(clickedID);

        const newLayouts = layouts.map(layout => {
            const newLayout = { ...layout };
            if (newLayout.i == clickedID) {
              if (newLayout.h==1) {
                newLayout.h = 3;
              } else {
                newLayout.h = 1;
              }
              console.log(layout);
            }
            return newLayout;
        });

        return newLayouts;
    },
///////////////////////////////////////////////////////
      componentDidUpdate(prevProps) {
        //check it new state userMongoProfile is different from last state's, then update
        if (this.props.userMongoProfile !== prevProps.userMongoProfile) {
          console.log("updating state");
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
            layouts: this.props.userMongoProfile.map(function(i, index) {
              return (
                {
                  i: i._id,
                  x: 0,
                  y: index,
                  w: 11.65,
                  h: 1,
                }
              )
            }),
            collapsedWidgets: {}
          });
        }
      },
///////////////////////////////////////////////////////
    generateDOM() {
      var columnCountArray=[];
      var elementHTMLTemplate= [];

      if (this.state.addressDetailElementsData){

        //determine all of the categories that the user has seleted as part of thier data saves to identify the correct number of columns to have inside the detail element
        this.state.addressDetailElementsData.forEach(function(el){
          Object.keys(el.poi).forEach(function(item){
            if(elementHTMLTemplate.indexOf(item)=='-1'){
              elementHTMLTemplate.push(item);
            }
          });
        });

        //Start creating element content based on # columns determined above
        console.log(elementHTMLTemplate);
        // console.log(this.state.addressDetailElementsData);
        // columnCountArray.forEach(function(category){
        //   elementContentHTML.push(
        //     <div>{el.poi[category][0]}</div>
        //   )
        // })

        return this.state.addressDetailElementsData.map((el, index) => {
          var division = [];
          elementHTMLTemplate.forEach(function(category){
            console.log(el);
            //if category is missing from that specific element... just insert a blank div (it will be later grayed out to make it clear what addresses can be compared on apple to apple basis)
            if (el.poi[category]) {
              division.push(
                <div>
                  <div>{el.poi[category][0]}</div>
                  <div>{el.poi[category][1]}</div>
                </div>
              )
            } else {
              division.push(
                <div></div>
              )
            }
          })


          return (
            <div key={el.i} className = {styles.addressDetailElement} onClick={this.toggleEl(el.i).bind(this)}>
              <div> {el.formatted_address}  </div>
                <div className={styles.componentContent}>
                  {division}
                </div>
              <span className={styles.remove} onClick={this.onRemoveItem.bind(this, el.i)}>x</span>
            </div>
          );
        });
      }
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
        console.log(data);
        xhr.send(data);

        console.log('removing', i);
        this.setState({addressDetailElementsData: _.reject(this.state.addressDetailElementsData, {i: i})});
      },
///////////////////////////////////////////////////////

    render() {
        const elements = this.generateDOM();

        const modifiedLayouts = this.getModifiedLayouts();

        return (<div style={{ marginTop: '5px' }}>
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
