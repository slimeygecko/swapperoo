const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/switcheroo.js',
  output: {
    filename: 'switcheroo.min.js',
    path: path.resolve(__dirname, 'dist')
  }
};