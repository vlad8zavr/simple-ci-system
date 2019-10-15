const http = require('http');
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

let timeStart;
let timeEnd;

console.log('os win', !!os.platform().match('win'));

request.post(
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

    exec(`git checkout ${hash}`, {cwd: `${repo}`}, (err, out) => {
        timeStart = (new Date).toLocaleString();
        if (err) {
            console.error('checkout error\n', err);
            res.end('[AGENT] CLOSED POST /build');
            sendBuildInfo(err);
        }
        else {
            res.end('[AGENT] CLOSED POST /build');
            buildAction(repo, command);
        }
        // res.end('[AGENT] CLOSED POST /build');
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

    let workerProcess = spawn(firstCom, arrCom, {cwd: `${repo}`, shell: true});

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
        console.log('==================================================================');
        //console.log('RESULTS HAVE BEEN MADE');
        sendBuildInfo(result, code);
    });
}

function isWindows() {
    return !!os.platform().match('win');
}

function sendBuildInfo(result, code = -1) {
    timeEnd = (new Date).toLocaleString();
    const url = `http://localhost:${SERVERPORT}/notify_build_result`;
    const json = { code: code, timeStart: timeStart, timeEnd: timeEnd, result: result };
    sendPostRequest(url, json);
    //makeCall(JSON.stringify(json)); 
}

function sendPostRequest(url, json) {
    request.post(
        url, {
            json: json
        }, (error, res, body) => {
            if (error) {
                console.log('request ERROR\n', error);
            }
            else {
                console.log(res.statusCode, body);
            }
        })
}

// function makeCall(body) {
//     var request = new http.ClientRequest({
//         hostname: "localhost",
//         port: SERVERPORT,
//         path: "/notify_build_result",
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Content-Length": Buffer.byteLength(body)
//         }
//     });
//     return request.end(body);
// }