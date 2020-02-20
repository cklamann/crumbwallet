const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv');
const webpack = require('webpack');

console.log(
    Object.entries(process.env)
        .map(([k, v]) => ({ [k]: JSON.stringify(v) }))
        .reduce((a, c) => {
            a[`process.env.${Object.keys(c)[0]}`] = Object.values(c)[0];
            return a;
        }, {})
);

module.exports = {
    mode: 'development',
    entry: './src/index.tsx',
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    output: {
        path: path.join(__dirname, 'dist/'),
        filename: 'index_bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: 'pre',
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.ejs',
        }),
        new webpack.DefinePlugin(
            //probably want to filter out all but those that begin with APP
            //also, this gives us db_user, etc but not TEST
            Object.entries(process.env)
                .map(([k, v]) => ({ [k]: JSON.stringify(v) }))
                .filter( obj => Object.keys(obj)[0].startsWith('APP_'))
                .reduce((a, c) => {
                    a[`process.env.${Object.keys(c)[0]}`] = Object.values(c)[0];
                    return a;
                }, {})
        ),
        new MiniCssExtractPlugin({
            filename: 'style.css',
        }),
    ],
};
