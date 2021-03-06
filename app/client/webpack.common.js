const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.mjs', '.json'],
        alias: {
            Hooks: path.resolve(__dirname, './src/hooks/'),
            Models: path.resolve(__dirname, './models/'),
            Shared: path.resolve(__dirname, './src/Components/Shared/'),
        },
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
                test: /\.mjs$/,
                type: 'javascript/auto',
            },
            {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: 'pre',
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    bail: true,
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.ejs',
        }),
        new ForkTsCheckerWebpackPlugin(),

        new webpack.DefinePlugin(
            Object.entries(process.env)
                .map(([k, v]) => ({ [k]: JSON.stringify(v) }))
                .filter((obj) => Object.keys(obj)[0].startsWith('APP_'))
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
