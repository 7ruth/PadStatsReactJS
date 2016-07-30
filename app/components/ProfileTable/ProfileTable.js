import React from 'react';
import ReactDOM from 'react-dom';
import styles from './styles.module.css';
import {Responsive, WidthProvider} from 'react-grid-layout';
import _ from 'lodash';
const ResponsiveReactGridLayout = WidthProvider(Responsive);


var ReactGridLayout = require('react-grid-layout');

var MyFirstGrid = React.createClass({

  componentDidUpdate(prevProps) {
    //check it new state userMongoProfile is different from last state's, then update
    if (this.props.userMongoProfile !== prevProps.userMongoProfile) {
      console.log("updating state");
      this.setState({
        items: this.props.userMongoProfile.map(function(i, key, list) {
          return {i: i._id, x: i * 2, y: 0, w: 2, h: 2, add: i === (list.length - 1).toString()};
        }),
        newCounter: 0
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
    var i = el.add ? '+' : el.i;
    return (
      <div key={i} data-grid={el}>
        {el.add ?
          <span className="add text" onClick={this.onAddItem} title="You can add an item by clicking here, too.">Add +</span>
        : <span className="text">{i}</span>}
        <span className="remove" style={removeStyle} onClick={this.onRemoveItem.bind(this, i)}>x</span>
      </div>
    );
  },
  onRemoveItem(i) {
    console.log('removing', i);
    this.setState({items: _.reject(this.state.items, {i: i})});
},

  render() {

    // {lg: layout1, md: layout2, ...}
    var layouts = {
      lg:[
        {i: 'a', x: 0, y: 0, w: 12, h: 1},
        {i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4},
        {i: 'c', x: 4, y: 0, w: 1, h: 2}],

    };

    if(this.props.userMongoProfile){
      var userTable =
      <div>
         <ResponsiveReactGridLayout className={styles.layout} layouts={layouts}
          breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
          cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}}>
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
