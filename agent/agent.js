//const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const { exec } = require('child_process');

const configFile = require('./config.json');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const HOST = '127.0.0.1';
const PORT = configFile.agentPort;
const SERVERPORT = configFile.serverPort;

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

    exec(`ls`, {cwd: `${req.body.repo}`}, (err, out) => {
        if (err) {
            console.error(err);
        }
        else {
            console.log('out\n', out);
        }
    })
})


app.listen(PORT, HOST, () => {
    console.log('Agent - listen to the port 8801 ...');
    console.log('configFile\n', configFile);
});