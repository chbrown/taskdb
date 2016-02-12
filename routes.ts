import {logger} from 'loge';

import {Route} from './models';
import api from './api';

import RoutesView from './components/Routes';
import {ErrorView} from './components/Layout';

import Task from './components/admin/Task';
import Tasks from './components/admin/Tasks';
import TaskType from './components/admin/TaskType';
import TaskTypes from './components/admin/TaskTypes';
import Worker from './components/admin/Worker';
import Workers from './components/admin/Workers';

import Work from './components/Work';

const routes: Route[] = [
  {
    url: '/api/:name',
    method: 'POST',
    handler({body, params}) {
      return api[params.name](body).then(props => ({props}));
    },
  },
  /*****************************************************************************
                                   task_types
  *****************************************************************************/
  {
    url: '/admin/task_types',
    method: 'GET',
    description: 'Get all task types',
    handler() {
      // return api.getTaskTypes().then(task_types => ({props: {task_types}, Component: TaskTypes}));
      return api.getTaskTypes().then(task_types => {
        logger.info('task_tyeps', task_types);
        return {props: {task_types}, Component: TaskTypes};
      });
    },
  },
  {
    url: '/admin/task_types/new',
    method: 'GET',
    description: 'Create blank task type',
    handler() {
      const props = {$schema: "http://json-schema.org/draft-04/schema#"};
      return {props, Component: TaskType};
    },
  },
  {
    url: '/admin/task_types',
    method: 'POST',
    handler({body}) {
      const {name, template, template_type, schema} = body;
      return api.insertTaskType({name, template, template_type, schema})
        .then(task_type => ({props: task_type}));
    },
  },
  {
    url: '/admin/task_types/:id',
    method: 'GET',
    description: 'Get single task type',
    handler({params}) {
      const {id} = params;
      return api.getTaskType({id})
        .then(task_type => ({props: task_type, Component: TaskType}));
    },
  },
  {
    url: '/admin/task_types/:id',
    method: 'PUT',
    handler({body, params}) {
      const {id} = params;
      return api.updateTaskType(Object.assign(body, {id}))
        .then(task_type => ({props: task_type}));
    },
  },
  /*****************************************************************************
                                   workers
  *****************************************************************************/
  {
    url: '/admin/workers',
    method: 'GET',
    description: 'Get all workers',
    handler() {
      return api.getWorkers().then(workers => ({props: {workers, Component: Workers}}));
    },
  },
  {
    url: '/admin/workers/new',
    method: 'GET',
    description: 'Create blank worker',
    handler() {
      return {props: {}, Component: Worker};
    },
  },
  {
    url: '/admin/workers',
    method: 'POST',
    handler({body}) {
      const {name, email, password} = body;
      return api.insertWorker({name, email, password}).then(worker => ({props: worker}));
    },
  },
  {
    url: '/admin/workers/:id',
    method: 'GET',
    description: 'Get single worker',
    handler({params}) {
      const {id} = params;
      return api.getWorker({id}).then(worker => ({props: worker, Component: Worker}));
    },
  },
  {
    url: '/admin/workers/:id',
    method: 'PUT',
    handler({body, params}) {
      const {id} = params;
      const {name, email, password} = body;
      return api.updateWorker({id, name, email, password}).then(worker => ({props: worker}));
    },
  },
  /*****************************************************************************
                                   tasks
  *****************************************************************************/
  {
    url: '/admin/tasks',
    method: 'GET',
    description: 'Get all tasks',
    handler() {
      return api.getTasks().then(tasks => ({props: {tasks}}));
    },
  },
  {
    url: '/admin/tasks/new',
    method: 'GET',
    description: 'Create a blank task',
    handler() {
      const props = {available: new Date(), priority: 0};
      return {props, Component: Task};
    },
  },
  {
    url: '/admin/tasks',
    method: 'POST',
    description: 'Insert new task into database',
    handler({body}) {
      const {task_type_id, context, priority} = this.body;
      return api.insertTask({task_type_id, context, priority}).then(task => ({props: task}));
    },
  },
  {
    url: '/tasks/:id',
    method: 'GET',
    description: 'Get single task with compiled template',
    handler({body, params}) {
      const {id} = params;
      return api.getTask({id}).then(task => ({props: task, Component: Task}));
    },
  },
  {
    url: '/admin/tasks/:id',
    method: 'PUT',
    description: 'Update existing task',
    handler({body, params}) {
      const {id} = params;
      const {task_type_id, context, priority,
        available, worker_id, started, completed, result} = body;
      const task = {id, task_type_id, context, priority,
        available, worker_id, started, completed, result};
      return api.updateTask(task).then(worker => ({props: worker}));
    },
  },
  /*****************************************************************************
                                   work
  *****************************************************************************/
  {
    url: '/tasks/next',
    method: 'GET',
    description: 'Get the next available tasks',
    handler() {
      return api.nextTasks().then(tasks => {
        // TypeScript gets confused by the lower return type, and requires the
        // error return type in the conditional to be the same.
        if (tasks.length === 0) {
          const props = {message: 'No tasks found'};
          return {statusCode: 404, Component: ErrorView, props} as any;
        }
        // reserve them, too. TODO: avoid the race condition somehow?
        return api.reserveTasks(tasks).then(() => {
          return {props: {tasks}};
        });
        // console.error('task reservation error', error);
      });
    },
  },
  {
    url: '/work',
    method: 'GET',
    description: 'Load next tasks to work on and display the top one',
    handler() {
      return api.nextTasks().then(tasks => {
        // reserve them, too.
        return api.reserveTasks(tasks).then(() => {
          return {props: {tasks}, Component: Work};
        });
      });
    },
  },
  {
    url: '/work/:id',
    method: 'GET',
    description: 'Display task to work on',
    handler({params}) {
      const {id} = params;
      return api.getTask({id}).then(task => {
        const tasks = [task];
        // reserve them, too.
        return api.reserveTasks(tasks).then(() => {
          return {props: {tasks, id}, Component: Work};
        });
      });
    },
  },
  /*****************************************************************************
                                     meta
  *****************************************************************************/
  {
    url: '/build/*',
    method: 'GET',
    handler({params}) {
      let {splat} = params;
      return {stream: api.readFile({path: `build/${splat}`})};
    },
  },
  {
    url: '/',
    method: 'GET',
    description: 'List app routes',
    handler() {
      return {props: {routes}, Component: RoutesView};
    },
  },
  {
    url: '*',
    method: '*',
    handler({method, pathname}: {method: string, pathname: string}) {
      let message = `No route found: ${method} ${pathname}`;
      return {props: {message}, Component: ErrorView, statusCode: 404};
    },
  },
];

export default routes;
