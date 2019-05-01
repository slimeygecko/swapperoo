const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/swapperoo.js',
  output: {
    filename: 'swapperoo.min.js',
    path: path.resolve(__dirname, 'dist')
  }
};