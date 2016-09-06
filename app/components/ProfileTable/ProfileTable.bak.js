import React from 'react';
import ReactDOM from 'react-dom';
import styles from './styles.module.css';
import {Responsive, WidthProvider} from 'react-grid-layout';
import _ from 'lodash';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var ReactGridLayout = require('react-grid-layout');

var MyFirstGrid = React.createClass({
  mixins: [PureRenderMixin],
  getInitialState() {
    return ({
      newCounter: 0
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
        }),
        collapsedWidgets: {},
        key: Math.random()
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
        {<div className="text" onClick={this.onCellClick.bind(this, el)}>{i}</div>}
        <span className="remove" style={removeStyle} onClick={this.onRemoveItem.bind(this, i)}>x</span>
      </div>
    );
  },
///////////////////////////////////////////////////////
  onCellClick(el) {
    console.log(el);
    // console.log(this.state.items.find(item=> item.i === id));
    // this.state.items.find(item=> item.i === id).h = 2;
    // console.log(this.state.items);
    // var newItems = this.state.items;
    // console.log(newItems);
    // var newKey = Math.random();
    //
    // console.log(newItems.find(item=> item.i === el.i));
    //
    // newItems.find(item=> item.i === el.i).h = 2;
    //
    // console.log(this.state.key);
    // console.log(Math.random());
    //
    // this.setState({
    //    items: newItems,
    //    key:newKey
    // });


            const newState = {...this.state.collapsedWidgets};
            console.log(this.state.collapsedWidgets);

            const collapsed = typeof newState[el.i] === 'boolean' ? newState[el.i] : false;
            console.log(collapsed);

            newState[el.i] = !collapsed;
            this.setState({
                collapsedWidgets: newState,
            });

  },
///////////////////////////////////////////////////////
  getModifiedItems() {
    const { items, collapsedWidgets } = this.state;
    console.log(collapsedWidgets);
    const newItems = items.map(item => {
        const newItem = { ...item };
        console.log(newItem);
        console.log(collapsedWidgets[newItem.i]);
        if (collapsedWidgets[newItem.i]) {
            newItem.h = 5;
        }
        return newItem;
    });

    return newItems;
  },
///////////////////////////////////////////////////////
  onResize(items) {
    this.setState({
        items,
    });
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
  render() {
    const modifiedItems = this.getModifiedItems()

    if(this.props.userMongoProfile){
      var userTable =
      <div>
        <ResponsiveReactGridLayout
          key={this.state.key}
          layout={modifiedItems}
          onLayoutChange={this.onLayoutChange}
          onBreakpointChange={this.onBreakpointChange}
          className={styles.layout}
          onResizeStop={::this.onResize}
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
