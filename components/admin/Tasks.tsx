import * as React from 'react';

import {Task} from '../../models';

const TasksTable = ({tasks}: {tasks: Task[]}) => (
  <div>
    <div className="hpad">
      <a href="/admin/tasks/new">New</a>
    </div>
    <table className="fill lined striped merge">
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
      <tbody>
        {tasks.map(task =>
          <tr key={task.id}>
            <td><a href={`/admin/tasks/${task.id}`}>{task.id}</a></td>
            <td>{JSON.stringify(task.context).slice(0, 80)}</td>
            <td>{task.task_type_id}</td>
            <td>{task.created}</td>
            <td>{task.available}</td>
            <td>{task.worker_id}</td>
            <td>{task.started}</td>
            <td>{task.completed}</td>
            <td>{JSON.stringify(task.result).slice(0, 80)}</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default TasksTable;
