const path = require('path');
module.exports = {
    mode: 'development',
    entry: './start.ts',
    resolve: {
        extensions: ['.ts', '.tsx', /*for graphql*/ '.mjs', '.js', '.json'],
        alias: {
            Models: path.resolve(__dirname, './models/')
        }
    },
    output: {
        path: path.join(__dirname, 'dist/'),
        filename: 'app.js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },
    target: 'node',
    node: {
        fs: 'empty',
    },
};
