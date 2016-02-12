import * as React from 'react';
import JSONArea from 'jsonarea';

import {Task} from '../../models';
import {bind, fetchJSON} from '../../util';

class TaskForm extends React.Component<Task, any> {
  constructor(props: Task) {
    super(props);
    this.state = Object.assign({}, props);
  }
  @bind
  onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    fetchJSON('/tasks', {
      method: (this.props.id as any === 'new') ? 'POST' : 'PUT',
      body: JSON.stringify(this.state),
    })
    .then(res => {
      console.log('fetch TaskType.onSubmit success', res);
    })
    .catch(error => console.error('fetch error', error));
  }
  @bind
  onChange(ev: React.FormEvent) {
    const input = ev.target as HTMLInputElement;
    console.log('onChange', ev, input);
    this.setState({[input.name]: input.value});
  }
  @bind
  onContextChange(context: any) {
    this.setState({context});
  }
  @bind
  onResultChange(result: any) {
    this.setState({result});
  }
  render() {
    return (
      <div className="hpad">
        <h2>Task</h2>
        <form onSubmit={this.onSubmit}>
          <label>
            <div><b>ID</b></div>
            <input type="text" value={this.state.id} disabled />
          </label>
          <label>
            <div><b>Task Type ID</b></div>
            <input type="text" name="task_type_id" value={this.state.task_type_id} onChange={this.onChange} />
          </label>
          <label>
            <div><b>Context</b></div>
            <JSONArea className="jsonarea" value={this.state.context} onChange={this.onContextChange} />
          </label>
          <label>
            <div><b>Priority</b></div>
            <input name="priority" type="number" value={this.state.priority} onChange={this.onChange} />
          </label>
          <label>
            <div><b>Available</b></div>
            <input type="text" name="available" value={this.state.available} onChange={this.onChange} />
          </label>
          <label>
            <div><b>Worker ID</b></div>
            <input type="text" name="worker_id" value={this.state.worker_id} onChange={this.onChange} />
          </label>
          <label>
            <div><b>Started</b></div>
            <input type="text" name="started" value={this.state.started} onChange={this.onChange} />
          </label>
          <label>
            <div><b>Completed</b></div>
            <input type="text" name="completed" value={this.state.completed} onChange={this.onChange} />
          </label>
          <label>
            <div><b>Result</b></div>
            <JSONArea className="jsonarea" value={this.state.result} onChange={this.onResultChange} />
          </label>
          <div>
            <button>Submit</button>
          </div>
        </form>
      </div>
    );
  }
}

export default TaskForm;
