const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    autoStart: './test/src/autoStart.js'
    , run: './test/src/run.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'test/dist')
  }
};