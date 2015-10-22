import {createHistory} from 'history';
import {reduxReactRouter, routerStateReducer} from 'redux-router';
import {createStore, applyMiddleware, compose} from 'redux';

function serverReducer(server = 'http://localhost:8275', action) {
  switch (action.type) {
  default:
    return server;
  }
}

function taskTypesReducer(task_types = [], action) {
  switch (action.type) {
  case 'ADD_TASK_TYPES':
    return task_types.concat(action.task_types);
  default:
    return task_types;
  }
}

function mergeTask(tasks, new_task) {
  var existing_task = tasks.find(task => task.id === new_task.id);
  // remove any existing tasks that have the same id
  var filtered_tasks = tasks.filter(task => task.id !== new_task.id);
  filtered_tasks.push({...new_task, ...existing_task});
  return filtered_tasks;
}

function tasksReducer(tasks = [], action) {
  switch (action.type) {
  case 'ADD_TASKS':
    return action.tasks.reduce(mergeTask, tasks);
  case 'ADD_TASK':
    return mergeTask(tasks, action.task);
  default:
    return tasks;
  }
}

function workersReducer(workers = [], action) {
  switch (action.type) {
  default:
    return workers;
  }
}

function errorsReducer(errors = [], action) {
  switch (action.type) {
  case 'LOG_ERRORS':
    // kind of a hack, adding on the timestamps here
    action.errors.forEach(error => error.thrown = new Date());
    return errors.concat(action.errors);
  default:
    return errors;
  }
}

// const reducer = combineReducers({
//   router: routerStateReducer,
//   ...
// });

function reducer(state = {}, action) {
  return {
    // React-Router:
    router: routerStateReducer(state.router, action),
    // remote server variable
    server: serverReducer(state.server, action),
    // remote server database resources
    task_types: taskTypesReducer(state.task_types, action),
    tasks: tasksReducer(state.tasks, action),
    // current_task:
    workers: workersReducer(state.workers, action),
    // errors
    errors: errorsReducer(state.errors, action),
  };
}

function thunkMiddleware({dispatch, getState}) {
  return next => action => (typeof action === 'function') ? action(dispatch, getState) : next(action);
}

export default compose(
  applyMiddleware(thunkMiddleware),
  reduxReactRouter({createHistory})
)(createStore)(reducer);
