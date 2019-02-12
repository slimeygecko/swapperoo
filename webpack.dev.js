const path = require('path');

module.exports = {
  mode: 'development',
  entry: './test/index.js',
  output: {
    filename: 'test.js',
    path: path.resolve(__dirname, 'test/dist')
  }
};