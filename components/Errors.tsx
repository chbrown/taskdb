import * as React from 'react';

export default class Errors extends React.Component<{errors: any[]}, {cutoff: number}> {
  constructor(props) {
    super(props);
    this.state = {cutoff: this.getCutoff()};
  }
  getCutoff() {
    return new Date().getTime() - 5000;
  }
  render() {
    // console.log('Errors#render()');
    const errors = this.props.errors.filter(error => error.thrown > this.state.cutoff);
    // set timeout in case there are still errors displayed
    if (errors.length > 0) {
      // console.log('Errors#render() setting timeout');
      setTimeout(() => this.setState({cutoff: this.getCutoff()}), 2500);
    }
    return (
      <div className="errors">
        {errors.map((error, i) =>
          <div key={i}>{error.thrown.toISOString()} {error.message}</div>
        )}
      </div>
    );
  }
}
