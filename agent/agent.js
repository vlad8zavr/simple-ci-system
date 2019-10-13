//const http = require('http');
const os = require('os');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const { exec, spawn } = require('child_process');

const configFile = require('./config.json');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const HOST = '127.0.0.1';
const PORT = configFile.agentPort;
const SERVERPORT = configFile.serverPort;

console.log('os', os.platform());
console.log('os win', !!os.platform().match('win'));

const req = request.post(
    `http://localhost:${SERVERPORT}/notify_agent`, {
        json: {
            host: HOST,
            port: PORT
        }
    }, (error, res, body) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log(res.statusCode, body);
        }
    })


app.post('/build', (req, res) => {
    console.log('build request');
    console.log(req.body);

    const { repo, hash, command } = req.body;

    // hash = 12d3f502

    exec(`git checkout ${hash}`, {cwd: `${repo}`}, (err, out) => {
        if (err) {
            console.error(err);
        }
        else {
            console.log('======== out ========\n', out);
            
            buildAction(repo, command)
            // spawn
            // stdout
            // stderr
        }
    })
})


app.listen(PORT, HOST, () => {
    console.log('Agent - listen to the port 8801 ...');
    console.log('configFile\n', configFile);
});

function buildAction(repo, command) {
    console.log('[buildAction]');

    let result = '';

    // console.log('os', os.platform());

    //let Com = `git ls-tree -r --name-only master`;
    let arrCom = command.trim().split(' ');

    if (isWindows()) {
        arrCom = arrCom.map(item => {
            if (item === 'npm') item = 'npm.cmd';
            return item;
        })
    }
    
    let firstCom = arrCom.shift();

    console.log('firstCom', firstCom);
    console.log('arrCom\n', arrCom);

    //let workerProcess = spawn('npm.cmd', ['run', 'build'], {cwd: `${repo}`});
    let workerProcess = spawn(firstCom, arrCom, {cwd: `${repo}`});
    // let workerProcess = spawn(`${command}`, [], {cwd: `${repo}`});

    workerProcess.stdout.on('data', data => {
        result += data.toString();
    });

    workerProcess.stderr.on('data', err => {
        console.log('stderr: ' + err);
    });

    workerProcess.on('close', code => {
        console.log(`Exit with code ${code}`);

        console.log('final result\n', result);
    });
}

function isWindows() {
    return !!os.platform().match('win');
}