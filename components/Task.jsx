import React from 'react';
import {connect} from 'react-redux';
import {pushState} from 'redux-router';

import {restParams, jsonOrDie} from '../common';

var _cached_components = {};
/**
Eval the requested template, or retrieve it from the cache if possible.

`template` is just a string.
*/
function evalTemplate(template) {
  var cached_component = _cached_components[template];
  if (cached_component === undefined) {
    // expose React for the component's use
    window.React = React;
    cached_component = _cached_components[template] = eval(template);
  }
  return cached_component;
}

@connect(store => ({server: store.server}))
class Task extends React.Component {
  componentDidMount() {
    // console.log('Task#componentDidMount()');
    this.mounted = new Date();
  }
  onSubmit(value) {
    var task = {
      // worker_id: null,
      started: this.mounted,
      completed: new Date(),
      result: value,
    };
    // console.log('Task#onSubmit() prep', task);
    var [url, params] = restParams(`${this.props.server}/tasks`, this.props.id, true);
    fetch(url, {...params, body: JSON.stringify(task)})
    .then(jsonOrDie)
    .then(task => {
      // console.log('Task#onSubmit() result', task);
      this.props.dispatch({type: 'ADD_TASK', task});
      // and get the next one
      this.props.dispatch(pushState(null, `/work`));
    })
    .catch(error => this.props.dispatch({type: 'LOG_ERRORS', errors: [error]}));
  }
  render() {
    // console.log('Task#render()', this.props);
    let TaskTemplate = evalTemplate(this.props.compiled_template);
    return <TaskTemplate onSubmit={this.onSubmit.bind(this)} {...this.props.context} />;
  }
  static propTypes = {
    // there's more to a task than this, but this is all we need:
    id: React.PropTypes.number.isRequired,
    context: React.PropTypes.any.isRequired,
    compiled_template: React.PropTypes.string.isRequired,
    // @connect props:
    server: React.PropTypes.string.isRequired,
  }
}

@connect(store => ({server: store.server}))
export default class TaskLoader extends React.Component {
  constructor(props) {
    super(props);
    // console.log('TaskLoader#constructor()', this.props.params.id);
    this.state = {};
  }
  refresh(props) {
    // console.log('TaskLoader#refresh()', props.params.id);
    var [url, params] = restParams(`${props.server}/tasks`, props.params.id);
    fetch(url, params)
    .then(jsonOrDie)
    .then(task => this.setState({task}))
    .catch(error => this.props.dispatch({type: 'LOG_ERRORS', errors: [error]}));
  }
  componentWillMount() {
    // console.log('TaskLoader#componentWillMount()', this.props.params.id);
    this.refresh(this.props);
  }
  componentWillReceiveProps(nextProps) {
    // console.log('TaskLoader#componentWillReceiveProps()', this.props.params.id, nextProps.params.id);
    this.refresh(nextProps);
  }
  render() {
    // console.log('TaskLoader#render()', this.state.task);
    return (
      <div className="task">
        {this.state.task ? <Task {...this.state.task} /> : <h4>Rendering task...</h4>}
      </div>
    );
  }
  static propTypes = {
    // params.id is the task_id as supplied by the route
    params: React.PropTypes.object.isRequired,
  }
}
