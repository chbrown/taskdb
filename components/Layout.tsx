import * as React from 'react';

export const ErrorView = ({message, stack}) => (
  <div className="hpad">
    <h2>Error!</h2>
    <h3 title="message">{message}</h3>
    <pre title="stack">{stack}</pre>
  </div>
);

export const NotFound = ({}) => (
  <h1>Route not found!</h1>
);

const Layout = ({children}) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <title>taskdb</title>
      <link href="/build/img/favicon.ico" rel="icon" type="image/x-icon" />
    </head>
    <body>
      <div id="app">{children}</div>
      <script src="/build/bundle.js"></script>
    </body>
  </html>
);

export default Layout;
