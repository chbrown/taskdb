var path = require('path');
var webpack = require('webpack');

var production = process.env.NODE_ENV == 'production';

module.exports = {
  entry: [
    './app',
  ].concat(production ? [] : [
    // 'webpack-hot-middleware/client',
  ]),
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/',
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(true),
  ].concat(production ? [
    // production-only
    new webpack.optimize.UglifyJsPlugin(),
  ] : [
    // development-only
    new webpack.NoErrorsPlugin(),
    // new webpack.HotModuleReplacementPlugin(),
  ]),
  resolve: {
    extensions: [
      '',
      // '.browser.tsx',
      // '.browser.ts',
      '.browser.js',
      // '.tsx',
      // '.ts',
      // '.jsx',
      '.js',
      '.less',
    ],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        loaders: ['babel-loader', 'ts-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
};
