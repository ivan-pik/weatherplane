const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');

const config = {
  entry:
  [
    "./src/frontend/index",
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
        },
        {
         test: /\.es6$/,
         exclude: /node_modules/,
         loader: 'babel-loader',
         query: {
           presets: ['react', 'es2015']
         }
       },
       {
          test: /\.vue$/,
          use: 'vue-loader',
        },
      ]

  },
  resolve: {
   extensions: ['*', '.js', '.es6']
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
