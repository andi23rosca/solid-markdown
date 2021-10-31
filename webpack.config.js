const path = require('path');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (_, { mode = 'development' }) => ({
  target: 'web',
  entry: {
    index: './lib/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js',
    library: 'solid-markdown',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true,
  },
  externals: {
    'solid-js': 'solid-js',
  },
  plugins: [new CleanWebpackPlugin(), ...(mode === 'production' ? [new TerserWebpackPlugin()] : [])],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        use: [
          'babel-loader'
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
});
