import React from 'react';
import {connect} from 'react-redux';
import {pushState, replaceState} from 'redux-router';
import {jsonOrDie} from '../common';

/**
WorkRedirect handles the redirect from work/ to work/1708 or whatever
*/
@connect(store => ({tasks: store.tasks}))
export class WorkRedirect extends React.Component {
  redirectIfAvailable(tasks) {
    var available_tasks = tasks.filter(task => task.completed === null);
    if (available_tasks.length > 0) {
      var current_task = available_tasks[0];
      // replaceState creates an action that the routerStateReducer handles
      this.props.dispatch(replaceState(null, `/work/${current_task.id}`));
    }
  }
  componentWillMount() {
    // console.log('WorkRedirect#componentWillMount()');
    this.redirectIfAvailable(this.props.tasks);
  }
  componentWillReceiveProps(nextProps) {
    // console.log('WorkRedirect#componentWillReceiveProps()');
    this.redirectIfAvailable(nextProps.tasks);
  }
  render() {
    // console.log('WorkRedirect#render()');
    return <h3 className="hpad">Loading...</h3>;
  }
}

@connect(store => ({server: store.server, tasks: store.tasks}))
export default class Work extends React.Component {
  /**
  filter down the list of available and incomplete tasks
  */
  getAvailableTasks() {
    var available_tasks = this.props.tasks.filter(task => task.completed === null);
    // console.log('Work#getAvailableTasks()', available_tasks.length);
    // surely there's a better way...
    if (available_tasks.length < 5) {
      fetch(`${this.props.server}/tasks/next`)
      .then(jsonOrDie)
      .then(tasks => {
        // console.log('Work#getAvailableTasks() fetched %d more tasks; adding to store', tasks.length);
        this.props.dispatch({type: 'ADD_TASKS', tasks: tasks});
      })
      .catch(error => this.props.dispatch({type: 'LOG_ERRORS', errors: [error]}));
    }
    return available_tasks;
  }
  render() {
    var available_tasks = this.getAvailableTasks();
    // console.log('Work#render()', available_tasks.length);
    return (
      <div>
        <div className="work-status">{available_tasks.length} tasks reserved</div>
        {this.props.children}
      </div>
    );
  }
  static propTypes = {
    tasks: React.PropTypes.array.isRequired,
    children: React.PropTypes.node.isRequired,
  }
}
