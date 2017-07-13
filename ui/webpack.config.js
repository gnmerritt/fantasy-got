const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

const devPlugins = isDevelopment ? [] : [
  // `-p` in CLI invocation means `--optimize-minimize` and `--optimize-occurrence-order`
  // which in turn mean apply these two optimization plugins.
  // uglify outputs a lot of warnings, and I can't figure out how to silence it when using `-p`,
  // so define and configure the plugin here
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
  }),
  new webpack.optimize.OccurrenceOrderPlugin(),
];

module.exports = {
  context: __dirname,
  entry: './app/main.jsx', // js entrypoint
  output: { // configuration for webpack output / build directory
    path: path.resolve(__dirname, 'build/'), // define build directory
    publicPath: '/', // webpack-dev-server uses this to determine where output files are expected to be served from
    filename: '[hash].js', // name of js output. [hash] tells webpack to name it a fingerprint of its contents
  },
  module: { // options affecting the normal modules
    loaders: [ // a loader understands how to read / compute different source files
      {
        test: /\.jsx?$/, // only affect .js or .jsx files
        include: [
          path.resolve(__dirname, 'app'), // only affect files in ./app
          path.resolve(__dirname, 'game'), // only affect files in ./app
        ],
        loader: 'babel-loader', // loader to use
        query: { presets: ['es2015', 'react', 'stage-3'] }, // configuration for babel-loader
      },
      // scss: compile sass, make paths relative, resolve urls, and extract to file
      {
        test: /\.scss$/,
        exclude: /\.module\.scss$/, // don't affect .module.scss files
        use: ExtractTextPlugin.extract({
          use: [
            { loader: 'css-loader', options: { minimize: !isDevelopment } },
            { loader: 'postcss-loader' },
            { loader: 'resolve-url-loader' },
            { loader: 'sass-loader', options: { sourceMap: true } },
          ],
        }),
      },
      { // load files (here, specifically, images). this allows us to refer to source paths.
        test: /\.png$/,
        loader: 'file-loader',
      },
    ],
  },
  // if building in development mode, provide source map with js output so browser dev tools can
  // show source files in their uncompiled states
  devtool: isDevelopment ? '#source-map' : undefined,
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: { // common configuration for webpack-dev-server, to be overridden / appended to
    contentBase: 'build/', // serve from build/ directory
    publicPath: '/',
    stats: 'minimal', // minimal console output
    host: '0.0.0.0', // serve from localhost and make it externally accessible via local ip
    inline: true,
    port: 4100,
  },
  plugins: devPlugins.concat([
    // corresponds to .scss loader usage of ExtractTextPlugin, takes output and puts it in build
    // directory with a fingerprinted name
    new ExtractTextPlugin('[hash].css'),
    new HtmlWebpackPlugin({ // autogenerates an index.html with the following parameters
      title: 'Issue Tracker',
      // TODO add this favicon
      // favicon: 'app/favicon.png'
    }),
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) } }),
  ]),
};
