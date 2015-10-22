import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import {jsonOrDie} from '../../common';

@connect(store => ({server: store.server, tasks: store.tasks}))
export default class Tasks extends React.Component {
  componentDidMount() {
    fetch(`${this.props.server}/tasks`)
    .then(jsonOrDie)
    .then(tasks => {
      this.props.dispatch({type: 'ADD_TASKS', tasks});
    })
    .catch(error => this.props.dispatch({type: 'LOG_ERRORS', errors: [error]}));
  }
  render() {
    let rows = this.props.tasks.map(task => {
      return (
        <tr key={task.id}>
          <td><Link to={`/admin/tasks/${task.id}`}>{task.id}</Link></td>
          <td>{JSON.stringify(task.context).slice(0, 80)}</td>
          <td>{task.task_type_id}</td>
          <td>{task.created}</td>
          <td>{task.available}</td>
          <td>{task.worker_id}</td>
          <td>{task.started}</td>
          <td>{task.completed}</td>
          <td>{JSON.stringify(task.result).slice(0, 80)}</td>
        </tr>
      );
    });
    return (
      <div className="hpad">
        <Link to={`/admin/tasks/new`}>New</Link>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Context</th>
              <th>Task Type ID</th>
              <th>Created</th>

              <th>Available</th>

              <th>Worker ID</th>
              <th>Started</th>
              <th>Completed</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  }
}
