const path = require('path'),
    fs = require('fs');

const lambdaDir = path.join(__dirname, 'src/lambdas/');

module.exports = {
    entry: fs
        .readdirSync(lambdaDir)
        .map((dir) => ({ [dir]: `${lambdaDir}${dir}/index.ts` }))
        .reduce((a, c) => ({ ...a, ...c })),
    resolve: {
        extensions: ['.ts', '.js', '.mjs', '.json'],
    },
    //handled in a lambda layer
    externals: ['canvas'],
    mode: 'development',
    output: {
        path: path.join(__dirname, `dist/lambdas`),
        filename: '[name].js',
        libraryTarget: 'umd',
    },
    devtool: 'inline-source-map',
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.mjs$/,
                type: 'javascript/auto',
            },
        ],
    },
};
