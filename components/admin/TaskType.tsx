import * as React from 'react';
import JSONArea from 'jsonarea';

import {TaskType} from '../../models';
import {bind, restParams, fetchJSON} from '../../util';

class TaskTypeForm extends React.Component<TaskType, any> {
  constructor(props) {
    super(props);
    this.state = Object.assign({}, props);
  }
  @bind
  onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const [url, params] = restParams('/task_types', this.props.id, true);
    const body = JSON.stringify(this.state);
    fetchJSON(url, Object.assign(params, {body}))
    .then(task_type => {
      console.log('TaskType#onSubmit success', task_type);
      this.setState(task_type);
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
  onSchemaChange(value: any) {
    this.setState({schema: value});
  }
  render() {
    return (
      <div className="hpad">
        <h2>Task Type</h2>
        <form onSubmit={this.onSubmit}>
          <label>
            <div><b>Name</b></div>
            <input type="text" name="name" value={this.state.name} onChange={this.onChange} />
          </label>
          <label>
            <div><b>Template</b></div>
            <textarea name="template" className="code" value={this.state.template} onChange={this.onChange} />
          </label>
          <label>
            <div><b>Template Type</b></div>
            <input name="template_type" type="text" value={this.state.template_type} onChange={this.onChange} />
          </label>
          <label>
            <div><b>Schema</b></div>
            <JSONArea className="jsonarea" value={this.state.schema} onChange={this.onSchemaChange} />
          </label>
          <div>
            <button>Submit</button>
          </div>
        </form>
      </div>
    );
  }
}

export default TaskTypeForm;
