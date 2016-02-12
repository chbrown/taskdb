import * as React from 'react';
import {Task} from '../models';
import {bind, fetchJSON, restParams} from '../util';

const _cached_components = {};
/**
Eval the requested template, or retrieve it from the cache if possible.
*/
function evalTemplate(template: string) {
  let cached_component = _cached_components[template];
  if (cached_component === undefined) {
    // expose React for the component's use
    if (typeof window !== 'undefined') {
      window['React'] = React;
    }
    else {
      global['React'] = React;
    }
    cached_component = _cached_components[template] = eval(template);
  }
  return cached_component;
}

class TaskDisplay extends React.Component<Task & {onSubmit?: (task: Task) => void}, {mounted: Date}> {
  constructor(props) {
    super(props);
    this.state = {mounted: null};
  }
  componentDidMount() {
    this.setState({mounted: new Date()});
  }
  @bind
  onSubmit(value) {
    console.log('TaskDisplay#onSubmit()', value);
    const task = Object.assign({}, this.props, {
      // worker_id: null,
      started: this.state.mounted,
      completed: new Date(),
      result: value,
    });
    if (this.props.onSubmit) {
      this.props.onSubmit(task);
    }
  }
  render() {
    const TaskTemplate = evalTemplate(this.props.compiledTemplate);
    return <TaskTemplate onSubmit={this.onSubmit.bind(this)} {...this.props.context} />;
  }
  static propTypes = {
    // there's more to a task than this, but this is all we need:
    id: React.PropTypes.number.isRequired,
    context: React.PropTypes.any.isRequired,
    compiledTemplate: React.PropTypes.string.isRequired,
    onSubmit: React.PropTypes.func,
  }
}

interface WorkProps {
  tasks: Task[];
}
interface WorkState {
  tasks: Task[];
}
class Work extends React.Component<WorkProps, WorkState> {
  constructor(props: WorkProps) {
    super(props);
    this.state = {tasks: props.tasks};
  }
  @bind
  onTaskSubmit(task: Task) {
    const [url, params] = restParams('/tasks', task.id, true);
    const requestParams = Object.assign(params, {body: JSON.stringify(task)})
    fetchJSON(url, requestParams)
    .then(({content: task}) => {
      console.log('Work#onTaskSubmit() result', task);
      const updatedTasks = this.state.tasks.filter(task => task.id !== null).concat(task);

      this.setState({tasks: updatedTasks});

      const {history}: {history: HistoryModule.History} = this.context as any;
      history.push('/work');
    })
    .catch(error => {
      console.error('Work#onTaskSubmit error', error);
    });
  }
  /**
  filter down the list of available and incomplete tasks
  */
  getAvailableTasks() {
    const availableTasks = this.props.tasks.filter(task => task.completed === null);
    console.log('Work#getAvailableTasks()', availableTasks.length);
    // surely there's a better way...
    if (availableTasks.length < 5) {
      fetchJSON('/tasks/next')
      .then(({content: nextTasks}) => {
        // console.log('Work#getAvailableTasks() fetched %d more tasks; adding to store', tasks.length);
        const tasks = this.state.tasks.concat(nextTasks);
        this.setState({tasks});
      })
      .catch(error => {
        console.error('Work#getAvailableTasks error', error);
      });
    }
    return availableTasks;
  }
  render() {
    const availableTasks = this.getAvailableTasks();
    // get the next one
    const task = availableTasks[0];
    return (
      <div>
        <div className="work-status">{availableTasks.length} tasks available</div>
        <div className="task">
          <TaskDisplay {...task} />
        </div>
      </div>
    );
  }
  static propTypes = {
    tasks: React.PropTypes.array.isRequired,
    children: React.PropTypes.node.isRequired,
  }
  static contextTypes = {
    history: React.PropTypes.object,
    location: React.PropTypes.object,
  }
}

export default Work;
