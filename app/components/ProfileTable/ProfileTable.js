import React from 'react';
import ReactDOM from 'react-dom';
import styles from './styles.module.css';
import {Responsive, WidthProvider} from 'react-grid-layout';
import _ from 'lodash';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var ReactGridLayout = require('react-grid-layout');

var clickedID = 0;

var MyFirstGrid = React.createClass({
  mixins: [PureRenderMixin],
  getInitialState() {
    return ({
      newCounter: 0,
      collapsedWidgets: {}
    });
  },
  getDefaultProps() {
    return {
      cols: {lg: 12, md: 10, sm: 6, xs: 4, xxs: 2},
      rowHeight: 100
    };
  },
///////////////////////////////////////////////////////
  componentDidUpdate(prevProps) {
    //check it new state userMongoProfile is different from last state's, then update
    if (this.props.userMongoProfile !== prevProps.userMongoProfile) {
      console.log("updating state");
      this.setState({
        items: this.props.userMongoProfile.map(function(i, key, list) {
        return {i: i._id, x: 0, y: 0, w: 12, h: 1, add: i === (list.length - 1).toString()};
        })
      });
    }
  },
  ///////////////////////////////////////////////////////
  createElement(el) {
    var removeStyle = {
      position: 'absolute',
      right: '2px',
      top: 0,
      cursor: 'pointer'
    };
    console.log(el);
    var i = el.add ? '+' : el.i;
    var propBag = { '_grid': el };
    return (
      <div key={i} {...propBag}>
        {el.add ?
          <span className="add text" onClick={this.onAddItem} title="You can add an item by clicking here, too.">Add +</span>
        : <div className="text" onClick={this.onCellClick.bind(this, i)}>{i}</div>}
        <span className="remove" style={removeStyle} onClick={this.onRemoveItem.bind(this, i)}>x</span>
      </div>
    );
  },
///////////////////////////////////////////////////////
  onCellClick(id) {
    console.log(id);
    clickedID = id;
    console.log(this.state.items);
    console.log(this.state.items.find(item=> item.i === id));
    this.state.items.find(item=> item.i === id).h = 2;
    console.log(this.state.items);
    var newState = this.state.items.find(item=> item.i === id).h = 2;

    // this.setState(newState);

    var expandingLayout = this.getModifiedLayouts();
    this.setState({
      items: expandingLayout
    })

  },
///////////////////////////////////////////////////////
  onRemoveItem(i) {
    console.log('removing', i);
    this.setState({items: _.reject(this.state.items, {i: i})});
  },
///////////////////////////////////////////////////////
  onLayoutChange(layout) {
    this.setState({layout: layout});
  },
///////////////////////////////////////////////////////
  onBreakpointChange(breakpoint, cols) {
    this.setState({
      breakpoint: breakpoint,
      cols: cols
    });
  },
///////////////////////////////////////////////////////
  onAddItem() {
  /*eslint no-console: 0*/
    console.log('adding', 'n' + this.state.newCounter);
    this.setState({
      // Add a new item. It must have a unique key!
      items: this.state.items.concat({
        i: 'n' + this.state.newCounter,
        x: this.state.items.length * 2 % (this.state.cols || 12),
        y: Infinity, // puts it at the bottom
        w: 2,
        h: 2
      }),
      // Increment the counter to ensure key is always unique.
      newCounter: this.state.newCounter + 1
    });
  },
  ///////////////////////////////////////////////////////
  getModifiedLayouts() {
      const { items, collapsedWidgets } = this.state;

      const newLayouts = items.map(layout => {
          const newLayout = { ...layout };
          if (layout.i === clickedID) {
              newLayout.h = 5;
          }
          return newLayout;
      });

      return newLayouts;
  },
///////////////////////////////////////////////////////
  render() {

    if(this.props.userMongoProfile){
      var userTable =
      <div>
        <ResponsiveReactGridLayout layout={this.state.items} className={styles.layout} onLayoutChange={this.onLayoutChange} onBreakpointChange={this.onBreakpointChange}
        {...this.props}>
          {_.map(this.state.items, this.createElement)}
        </ResponsiveReactGridLayout>
      </div>
    } else {
      var userTable = <div></div>;
    }

    console.log(userTable);

    return (
      <div>
        {userTable}
      </div>
    )
  }
});

export default MyFirstGrid;
