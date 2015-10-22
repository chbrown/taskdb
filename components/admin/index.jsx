import React from 'react';
import {Route, IndexRoute, Link} from 'react-router';

import Tasks from './Tasks';
import Task from './Task';
import TaskTypes from './TaskTypes';
import TaskType from './TaskType';
import Workers from './Workers';
import Worker from './Worker';

class AdminApp extends React.Component {
  render() {
    return (
      <div>
        <header>
          <nav>
            <span className="tab">
              <Link to="/admin/tasks">Tasks</Link>
            </span>
            <span className="tab">
              <Link to="/admin/task_types">Task Types</Link>
            </span>
            <span className="tab">
              <Link to="/admin/workers">Workers</Link>
            </span>
          </nav>
        </header>
        {this.props.children}
      </div>
    );
  }
  static propTypes = {
    children: React.PropTypes.node.isRequired,
  }
}

export default (
  <Route path="admin" component={AdminApp}>
    <Route path="task_types">
      <Route path=":id" component={TaskType} />
      <IndexRoute component={TaskTypes} />
    </Route>
    <Route path="workers">
      <Route path=":id" component={Worker} />
      <IndexRoute component={Workers} />
    </Route>
    <Route path="tasks">
      <Route path=":id" component={Task} />
      <IndexRoute component={Tasks} />
    </Route>
  </Route>
);
