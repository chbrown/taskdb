var path = require('path');
var webpack = require('webpack');

var production = process.env.NODE_ENV == 'production';

var entry = production ? [
  './app',
] : [
  'webpack-hot-middleware/client',
  './app',
];

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(true),
].concat(production ? [
  // production-only
  new webpack.optimize.UglifyJsPlugin(),
] : [
  // development-only
  new webpack.NoErrorsPlugin(),
  new webpack.HotModuleReplacementPlugin(),
]);

module.exports = {
  // devtool: 'source-map', // 'eval'
  entry: entry,
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/'
  },
  plugins: plugins,
  resolve: {
    extensions: [
      '',
      '.js',
      '.jsx',
      '.less',
    ],
  },
  resolveLoader: {
    // otherwise, webpack will look for json-loader relative to the modules
    // themselves, which will break on `npm link`'ed modules
    // root: path.join(__dirname, 'node_modules'),
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        include: __dirname,
        exclude: /node_modules/,
      },
      {
        test: /\.jsx$/,
        loaders: ['babel-loader'],
        include: __dirname,
        // exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader'],
      }
    ]
  }
};
