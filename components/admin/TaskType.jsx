import React from 'react';
import {connect} from 'react-redux';
import JSONArea from 'jsonarea';

import {restParams, jsonOrDie} from '../../common';

@connect(state => ({server: state.server}))
export default class TaskType extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillMount() {
    var [url,] = restParams(`${this.props.server}/task_types`, this.props.params.id);
    fetch(url)
    .then(jsonOrDie)
    .then(task_type => {
      this.setState(task_type);
    })
    .catch(error => this.props.dispatch({type: 'LOG_ERRORS', errors: [error]}));
  }
  onSubmit(ev) {
    ev.preventDefault();
    var [url, params] = restParams(`${this.props.server}/task_types`, this.props.params.id, true);
    var body = JSON.stringify(this.state);
    fetch(url, {...params, body})
    .then(jsonOrDie)
    .then(task_type => {
      console.log('TaskType#onSubmit success', task_type);
      this.setState(task_type);
    })
    .catch(error => console.error('fetch error', error));
  }
  onChange(name, ev) {
    console.log('onChange', name, ev);
    this.setState({[name]: ev.target.value});
  }
  render() {
    return (
      <div className="hpad">
        <h2>Task Type</h2>
        <form onSubmit={this.onSubmit.bind(this)}>
          <label>
            <div><b>Name</b></div>
            <input type="text" value={this.state.name}
              onChange={this.onChange.bind(this, "name")} />
          </label>
          <label>
            <div><b>Template</b></div>
            <textarea value={this.state.template} className="code"
              onChange={this.onChange.bind(this, "template")} />
          </label>
          <label>
            <div><b>Template Type</b></div>
            <input type="text" value={this.state.template_type}
              onChange={this.onChange.bind(this, "template_type")} />
          </label>
          <label>
            <div><b>Schema</b></div>
            <JSONArea value={this.state.schema} className="jsonarea"
              onChange={this.onChange.bind(this, "schema")} />
          </label>
          <div>
            <button>Submit</button>
          </div>
        </form>
      </div>
    );
  }
}
