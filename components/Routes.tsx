import * as React from 'react';

import {Route} from '../models';

const RoutesView = ({routes}: {routes: Route[]}) => (
  <div className="hpad">
    <h3>All Routes</h3>
    <ul>
      {routes.filter(route => (route.method == 'GET' || route.method == '*') && route.description !== undefined).map(route =>
        <li key={route.method + ' ' + route.url}>
          <a href={route.url}>{route.description || route.url}</a>
        </li>
      )}
    </ul>
  </div>
);

export default RoutesView;
