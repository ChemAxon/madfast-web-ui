/**
 * Webpack configuration to make the contents of this repository compilable.
 *
 * This webpack config is different from the one used by the MadFast Web UI.
 */
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/js-client-limited/js-client-limited-index.js',
  output: {
    // Note that no common bundle is built
    filename: 'js-client-limited.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      // Babel
      // Based on https://webpack.js.org/loaders/babel-loader/
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      // When you import './my-image.png', that image will be processed and added to your output directory
      // and the MyImage variable will contain the final url of that image after processing.
      {
        test: /\.(png|svg|jpg|gif)$/,
        // See https://github.com/webpack-contrib/file-loader
        // Make assets public path relative to dist/
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: 'dist/'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        // See https://github.com/webpack-contrib/file-loader
        // Make assets public path relative to dist/
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: 'dist/'
            }
          }
        ]
      }
    ]
  },
  plugins: [
        // Automatically load modules instead of having to import or require them everywhere.
        // note that Bootstrap and jQuery UI needs jQuery to be provided,
        // see http://getbootstrap.com/docs/4.0/getting-started/webpack/
        // It is a goal to use the fewest possible provided modules in order to avoid "automagically" present undeclared
        // variables in the code base. The intended usage of these dependencies is to include the appropriate module
        // from deps/.
        new webpack.ProvidePlugin({
            "$": "jquery",
            // "jQuery": "jquery",
            // "window.jQuery": "jquery"
        })
      
  ]
};