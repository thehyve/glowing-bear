var webpack = require('webpack');

module.exports = {
  plugins: [
    // some libs expect global to be set, and 'self' instead of 'window' allows compatibility with web worker
    new webpack.DefinePlugin({
      'global': 'self',
    }),
  ],
  // disable node polyfills, solves issues related to buffer and process
  node: {
    global: false,
    __filename: false,
    __dirname: false,
  },
}
