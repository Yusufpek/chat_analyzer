const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true,
    publicPath: '/'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@containers': path.resolve(__dirname, 'src/containers'),
      '@Modals': path.resolve(__dirname, 'src/containers/Modals'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@api': path.resolve(__dirname, 'src/api')
    }
  },
  devtool: 'source-map',
  devServer: {
    static: { directory: path.resolve(__dirname, 'public') },
    historyApiFallback: true,
    port: 5173,
    open: true,
    hot: true
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.s?css$/, use: ['style-loader', 'css-loader', 'sass-loader'] }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'public/index.html') })
  ]
};
