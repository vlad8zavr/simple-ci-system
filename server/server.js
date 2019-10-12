
// const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const HOST = '127.0.0.1';
const PORT = 8800;
const agentsList = [];

// global.pathToRep = process.argv[2];

function registerAgent(info) {
    if (info.host && info.port) {
        agentsList.push({ host: info.host, port: info.port });
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

app.listen(PORT, HOST, () => {
    console.log('yo dawgs, now listen to the port 8800 (server) ...');
});