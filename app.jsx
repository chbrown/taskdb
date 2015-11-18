import React from 'react';
import ReactDOM from 'react-dom';
import {Route, IndexRoute, IndexRedirect} from 'react-router';
import {Provider} from 'react-redux';
import {ReduxRouter} from 'redux-router';

import './site.less';

import store from './store';

import adminRoute from './components/admin';
import Errors from './components/Errors';
import Work, {WorkRedirect} from './components/Work';
import Task from './components/Task';

class App extends React.Component {
  render() {
    return (
      <main>
        <Errors />
        {this.props.children}
      </main>
    );
  }
  static propTypes = {
    children: React.PropTypes.node,
  }
}

class NotFound extends React.Component {
  render() {
    return <h1>Route not found!</h1>;
  }
}

ReactDOM.render((
  <Provider store={store}>
    <ReduxRouter>
      <Route path="/" component={App}>
        {adminRoute}
        <Route path="work" component={Work}>
          <Route path=":id" component={Task} />
          <IndexRoute component={WorkRedirect} />
        </Route>
        <Route path="*" component={NotFound} />
        <IndexRedirect to="work" />
      </Route>
    </ReduxRouter>
  </Provider>
), document.getElementById('app'));
