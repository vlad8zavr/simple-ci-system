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
            //console.log('======== out ========\n', out);
            
            buildAction(repo, command);
        }
    })
})


app.listen(PORT, HOST, () => {
    console.log('Agent - listen to the port 8801 ...');
    console.log('configFile\n', configFile);
});

function buildAction(repo, command) {
    console.log('[buildAction]');

    let arrCom = command.trim().split(' ');

    if (isWindows()) {
        arrCom = arrCom.map(item => {
            if (item === 'npm') item = 'npm.cmd';
            return item;
        })
    }
    
    let firstCom = arrCom.shift();

    let result = '';
    let workerProcess = spawn(firstCom, arrCom, {cwd: `${repo}`});

    workerProcess.stdout.on('data', data => {
        result += data.toString();
    });

    workerProcess.stderr.on('data', err => {
        console.log('stderr: ' + err);
        sendBuildInfo(err);
    });

    workerProcess.on('close', code => {
        console.log(`Exit with code ${code}`);

        console.log('final result\n', result);

        // post request back to server with
        // code: code <= (status ok or not)
        // result: result
        sendBuildInfo(result, code);
    });
}

function isWindows() {
    return !!os.platform().match('win');
}

function sendBuildInfo(result, code = -1) {
    if (code === -1) {
        // error
    }
    else {
        const req = request.post(
            `http://localhost:${SERVERPORT}/notify_build_result`, {
                json: {
                    code: code,
                    result: result
                }
            }, (error, res, body) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log(res.statusCode, body);
                }
            })
    }
}