import React from 'react';
import {connect} from 'react-redux';

@connect(store => ({errors: store.errors}))
export default class Errors extends React.Component {
  constructor(props) {
    super(props);
    this.state = {cutoff: this.getCutoff()};
  }
  getCutoff() {
    return new Date() - 5000;
  }
  render() {
    // console.log('Errors#render()');
    var errors = this.props.errors.filter(error => error.thrown > this.state.cutoff);
    // set timeout in case there are still errors displayed
    if (errors.length > 0) {
      // console.log('Errors#render() setting timeout');
      setTimeout(() => this.setState({cutoff: this.getCutoff()}), 2500);
    }
    return (
      <div className="errors">
        {errors.map((error, i) => (
          <div key={i}>{error.thrown.toISOString()} {error.message}</div>
        ))}
      </div>
    );
  }
}
