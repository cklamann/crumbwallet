#!/usr/bin/node

const AWS = require('aws-sdk'),
    fs = require('fs'),
    path = require('path'),
    { execSync } = require('child_process'),
    Lambda = new AWS.Lambda({ region: 'us-east-2' });

const main = () => {
    const args = process.argv.slice(2);

    if (args.length == 0) {
        throw 'lambda name is required!';
    }

    const lambdaName = args[0],
        targetPath = path.resolve(...[__dirname, '..', 'src/lambdas', lambdaName]);

    if (!fs.existsSync(targetPath)) {
        throw `path  ${targetPath} does not exist!`;
    }

    console.log(`Updating lambda ${lambdaName} ...`);

    /*  
     note that passing --entry to webpack will override what's in ts-config BUT it will also disable dynamic filenaming :(
     so the easy workaround is to build everything but only push what we want to publish
     this is irritating but the files are small so for now the effect is a slight lag
    */
    execSync('./node_modules/.bin/webpack --config ./webpack.lambda.js');
    Lambda.listFunctions({}, (err, data) => {
        const lambda = data['Functions'].find((f) => f['FunctionName'] === lambdaName);

        if (!lambda) {
            throw 'Lambda ' + lambdaName + ' not found!';
        }

        const lambdaPath = path.resolve(...[__dirname, '..', 'dist', 'lambdas', `${lambdaName}`]),
            zipPath = `${lambdaPath}.zip`,
            filePath = `${lambdaPath}.js`;

        if (fs.existsSync(zipPath)) {
            console.log('deleting old zip archive!');
            fs.unlinkSync(zipPath);
        }

        execSync(`zip -j ${zipPath} ${filePath}`);

        const zipBuffer = fs.readFileSync(zipPath);

        res = Lambda.updateFunctionCode({ FunctionName: lambdaName, ZipFile: zipBuffer }, complete);
    });

    const complete = (err, res) => {
        console.log(res['LastUpdateStatus']);
        return;
    };
};

main();
