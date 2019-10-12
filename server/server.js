
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8800;
const agentsList = [];

// global.pathToRep = process.argv[2];

function registerAgent(info) {
    let isExist;
    if (info.port) {
        isExist = !!(agentsList.filter(item => item === info.port)[0]);
        //!isExist && agentsList.push(info.port);
    }
    if (info.port && !isExist) {
        agentsList.push(info.port);
        return true;
    }
    else return false;
}

app.post('/notify_agent', (req, res) => {
    console.log(req.body);
    let isRegistered = registerAgent(req.body);
    if (isRegistered) res.send(true);
    else res.send(false);

    console.log('agentList\n', agentsList);
});

app.listen(PORT, '127.0.0.1', () => {
    console.log('yo dawgs, now listen to the port 8800 (server) ...');
});