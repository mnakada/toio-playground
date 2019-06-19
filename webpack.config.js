const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const VueLoadewrPlugin = require('vue-loader/lib/plugin');

process.noDeprecation = true;

module.exports = {
  entry: {
    'bundle': [
      './source/js/ToioPlayground.js',
      './source/index.html',
    ]
  },
  output: {
    path: __dirname + '/frontend',
    filename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /index\.html/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', {modules: false}]],
            },
          },
        ],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'eslint-loader',
            options: {
              configFile: './eslintjs'
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        enforce: 'pre',
        test: /vue\/.*\.vue$/,
        use: [
          {
            loader: 'eslint-loader',
            options: {
              configFile: './eslintvue'
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader:  'css-loader',
          }
        ]
      },
      {
        test: /\.(ttf|otf|woff|woff2)(\?.+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: './fonts/[name].[ext]',
            },
          },
        ],
      },
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js',
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new TerserPlugin(),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /js\/.*\.js$/,
      threshold: 0,
      minRatio: 0.8,
      deleteOriginalAssets: true
    }),
    new VueLoadewrPlugin(),
  ],
};


