import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {createHistory, useQueries} from 'history';
import * as urlio from 'urlio';
import {ReactType} from 'http-respond';

import routes from './routes';

import './site.less';

const history = useQueries(createHistory)();

class Provider extends React.Component<{children: ReactType<any>[], location: any}, {}> {
  getChildContext() {
    return {history, location: this.props.location};
  }
  render() {
    // wrapping in a DOM element here breaks isomorphism, so we use this weird
    // React.Children.only() thing (like in Redux's Provider)
    return React.Children.only(this.props.children) as any;
  }
  // oddly, React.ValidationMap<any> is required for both of these statics
  // otherwise, TypeScript doesn't like them as static members of the Provider class
  static propTypes: React.ValidationMap<any> = {
    children: React.PropTypes.any.isRequired,
    location: React.PropTypes.object.isRequired,
  }
  static childContextTypes: React.ValidationMap<any> = {
    history: React.PropTypes.object.isRequired,
    location: React.PropTypes.object.isRequired,
  }
}

history.listen(location => {
  const {pathname} = location;
  console.log('history:listen', pathname, location);

  let matchingRoute = urlio.parse(routes, {url: pathname, method: 'GET'});
  if (matchingRoute !== undefined) {
    let req = {params: matchingRoute.params, query: location.query, method: 'GET', pathname};
    Promise.resolve(matchingRoute.handler(req)).then(payload => {
      const element = React.createElement(Provider, {location} as any,
        React.createElement(payload.Component as any, payload.props));
      return ReactDOM.render(element, document.getElementById('app'));
    })
    .catch(reason => {
      console.error('route.handler or ReactDOM.render failed:', reason);
    });
  }
  else {
    console.error('No route found for location', location);
  }
});
