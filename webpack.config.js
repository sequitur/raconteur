module.exports = {
  entry: 'mocha!./spec/index.js',
  output: {
    filename: 'test.build.js',
    path: './spec/',
    publicPath: '/spec/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }
}
