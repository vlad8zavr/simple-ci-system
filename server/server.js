
// const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const request = require('request');

const configFile = require('./config.json');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const HOST = '127.0.0.1';
const PORT = configFile.port;
const agentList = [];


// draw html
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: path.join(__dirname, '../html')});
})

function registerAgent(info) {
    if (info.host && info.port) {
        agentList.push({ host: info.host, port: info.port, isFree: true });
        return true;
    }
    else return false;
}

// agent registration
app.post('/notify_agent', (req, res) => {
    console.log(req.body);
    let isRegistered = registerAgent(req.body);
    if (isRegistered) res.send(true);
    else res.send(false);

    console.log('agentList\n', agentList);
});

app.post('/build_request', (req, res) => {
    console.log('Build request received');
    console.log(req.body);

    // here we send build request to a free agent
    // цикл for чтобы можно было выйти break
    for (let i = 0, length = agentList.length; i < length; i++) {
        let agent = agentList[i];
        if (agent.isFree === true) {
            agent.isFree = false;
            const requestToAgent = request.post(
                `http://${agent.host}:${agent.port}/build`, {
                    json: {
                        hash: req.body.hash,
                        command: req.body.command
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
        console.log('after send agentList\n', agentList);
    }
});

app.listen(PORT, HOST, () => {
    console.log('Server - listen to the port 8800 ...');
    console.log('configFile\n', configFile);
});