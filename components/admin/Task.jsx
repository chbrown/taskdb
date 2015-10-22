import React from 'react';
import {connect} from 'react-redux';
import JSONArea from 'jsonarea';

import {jsonOrDie} from '../../common';

@connect(store => ({server: store.server}))
export default class Task extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillMount() {
    fetch(`${this.props.server}/tasks/${this.props.params.id}`)
    .then(jsonOrDie)
    .then(task => this.setState(task))
    .catch(error => this.props.dispatch({type: 'LOG_ERRORS', errors: [error]}));
  }
  onSubmit(ev) {
    ev.preventDefault();
    fetch(`${this.props.server}/tasks`, {
      method: (this.props.params.id == 'new') ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state),
    })
    .then(res => {
      console.log('fetch TaskType.onSubmit success', res);
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
        <h2>Task</h2>
        <form onSubmit={this.onSubmit.bind(this)}>
          <label>
            <div><b>ID</b></div>
            <input type="text" value={this.state.id} disabled />
          </label>
          <label>
            <div><b>Task Type ID</b></div>
            <input type="text" value={this.state.task_type_id}
              onChange={this.onChange.bind(this, "task_type_id")} />
          </label>
          <label>
            <div><b>Context</b></div>
            <JSONArea value={this.state.context} className="jsonarea"
              onChange={this.onChange.bind(this, "context")} />
          </label>
          <label>
            <div><b>Priority</b></div>
            <input type="number" value={this.state.priority}
              onChange={this.onChange.bind(this, "priority")} />
          </label>
          <label>
            <div><b>Available</b></div>
            <input type="text" value={this.state.available}
              onChange={this.onChange.bind(this, "available")} />
          </label>
          <label>
            <div><b>Worker ID</b></div>
            <input type="text" value={this.state.worker_id}
              onChange={this.onChange.bind(this, "worker_id")} />
          </label>
          <label>
            <div><b>Started</b></div>
            <input type="text" value={this.state.started}
              onChange={this.onChange.bind(this, "started")} />
          </label>
          <label>
            <div><b>Completed</b></div>
            <input type="text" value={this.state.completed}
              onChange={this.onChange.bind(this, "completed")} />
          </label>
          <label>
            <div><b>Result</b></div>
            <JSONArea value={this.state.result} className="jsonarea"
              onChange={this.onChange.bind(this, "result")} />
          </label>
          <div>
            <button>Submit</button>
          </div>
        </form>
      </div>
    );
  }
}
