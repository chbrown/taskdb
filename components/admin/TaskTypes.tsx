import * as React from 'react';
import {TaskType} from '../../models';

const TaskTypesTable = ({task_types}: {task_types: TaskType[]}) => (
  <div>
    <div className="hpad">
      <a href="/admin/task_types/new">New</a>
    </div>
    <table className="fill lined striped merge">
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
      <tbody>
        {task_types.map(task_type =>
          <tr key={task_type.id}>
            <td>{task_type.id}</td>
            <td><a href={`/admin/task_types/${task_type.id}`}>{task_type.name}</a></td>
            <td>{task_type.template.slice(0, 80)}</td>
            <td>{task_type.template_type}</td>
            <td>{JSON.stringify(task_type.schema).slice(0, 80)}</td>
            <td>{task_type.created}</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default TaskTypesTable;
