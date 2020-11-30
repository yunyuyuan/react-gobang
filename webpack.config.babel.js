const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const path = require('path');

const resolve = (p)=>path.resolve(__dirname, p);

module.exports = {
    entry: {
        'index': resolve('src/index.js')
    },
    output: {
        path: resolve( 'dist'),
        filename: "[name].[chunkhash].js",
        publicPath: 'https://cdn.jsdelivr.net/gh/yunyuyuan/react-gobang@latest/build'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: '../index.html',
            chunks: ['index']
        })
    ],
    mode: process.env.NODE_ENV,
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
    },
}