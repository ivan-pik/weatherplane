const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');

const config = {
  entry:
  [
    "./src/frontend/index.js",
    "./src/scss/main.scss"
  ],
  output: {
    filename: "./src/public/js/scripts.js"
  },
  module: {
    rules:
      [
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              `css-loader`,
              'postcss-loader',
              `sass-loader`,
            ],
          }),
        }
      ]

  },
  plugins: [
    new ExtractTextPlugin("./src/public/css/styles.css"),
    new webpack.LoaderOptionsPlugin({
      test: /\.s?css$/,
      options: {
        output: { path: './test/' },
        postcss: [
          autoprefixer({ browsers: ['last 2 versions', 'android 4', 'opera 12'] }),
        ],
      },
    }),
  ],
  watch: true
}

module.exports = config;
