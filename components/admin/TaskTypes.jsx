import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import {jsonOrDie} from '../../common';

@connect(state => ({server: state.server, task_types: state.task_types}))
export default class TaskTypes extends React.Component {
  componentWillMount() {
    fetch(`${this.props.server}/task_types`)
    .then(jsonOrDie)
    .then(task_types => {
      this.props.dispatch({type: 'ADD_TASK_TYPES', task_types});
    })
    .catch(error => this.props.dispatch({type: 'LOG_ERRORS', errors: [error]}));
  }
  render() {
    let rows = this.props.task_types.map(task_type => {
      return (
        <tr key={task_type.id}>
          <td>{task_type.id}</td>
          <td><Link to={`/admin/task_types/${task_type.id}`}>{task_type.name}</Link></td>
          <td>{task_type.template.slice(0, 80)}</td>
          <td>{task_type.template_type}</td>
          <td>{JSON.stringify(task_type.schema).slice(0, 80)}</td>
          <td>{task_type.created}</td>
        </tr>
      );
    });
    return (
      <div className="hpad">
        <Link to={`/admin/task_types/new`}>New</Link>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Template</th>
              <th>Template Type</th>
              <th>Schema</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  }
}
